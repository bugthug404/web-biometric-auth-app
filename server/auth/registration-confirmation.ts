import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { LocalStorage } from "node-localstorage";
import { Request, Response } from "express";
import { User } from "../utils/types";

export async function registrationConfirmation(req: Request, res: Response) {
  const localStorage = new LocalStorage("./scratch");
  let user: User | null = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    user = {
      id: "internalUserId",
      username: "user@localhost",
      devices: [],
    };
  } else {
    // We need to convert the regular arrays to Uint8Arrays
    // because regular arrays are easier to store in local storage
    // but the WebAuthn API requires Uint8Arrays
    // You can skip this step if you are storing the data as Uint8Arrays in your database
    const devices = user.devices.map((device) => {
      const uint8Array32 = new Uint8Array(32);
      const uint8Array272 = new Uint8Array(272);
      for (let i = 0; i < 32; i++) {
        uint8Array32[i] = device.credentialID[i] || 0;
      }
      for (let i = 0; i < 272; i++) {
        uint8Array272[i] = device.credentialPublicKey[i] || 0;
      }
      return {
        ...device,
        credentialID: uint8Array32,
        credentialPublicKey: uint8Array272,
      };
    });
    user = {
      ...user,
      devices,
    };
  }

  const body = req.body.attResp;
  const options = JSON.parse(
    localStorage.getItem("registrationOptions") || "{}"
  );
  // const challenge = req.session.currentChallenge;
  const expectedChallenge = options.challenge;
  const expectedOrigin = process.env.EXPECTED_ORIGIN;

  if (!expectedOrigin) {
    return res.status(400).send({ error: "Expected origin not found" });
  }
  const rpId = process.env.RP_ID;
  let verification;
  try {
    const opts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: expectedOrigin ?? "",
      expectedRPID: rpId ?? "",
      requireUserVerification: true,
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error: any) {
    return res.status(500).json({
      error: "Unknown error",
    });
  }

  const { verified, registrationInfo } = verification;
  let existingDevice;
  let newDevice;
  if (verified && registrationInfo) {
    try {
      const { credentialPublicKey, credentialID, counter } = registrationInfo;

      // this prevents registering the same device twice
      existingDevice = user?.devices?.find((device) => {
        return isoUint8Array.areEqual(device?.credentialID, credentialID);
      });

      if (!existingDevice) {
        newDevice = {
          credentialPublicKey,
          credentialID,
          counter,
          transports: body?.response?.transports ?? [],
        };
      }
    } catch (error: any) {
      return res.status(500).json({
        error: "Unknown error",
      });
    }
  }

  // save device to user devices in local storage
  if (newDevice) {
    user.devices.push(newDevice);
    localStorage.setItem("user", JSON.stringify(user));
  }
  return res.json({ verified, registrationInfo, newDevice });
}
