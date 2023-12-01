import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import {
  VerifyAuthenticationResponseOpts,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { LocalStorage } from "node-localstorage";
import { Request, Response } from "express";
import { Options, User } from "../utils/types";

export async function authenticationConfirmation(req: Request, res: Response) {
  const localStorage = new LocalStorage("./scratch");
  const body = req.body.attResp;
  console.log("body", body);

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
      console.log("device", device.credentialPublicKey);

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

  const rpId = "localhost";
  const expectedOrigin = "https://localhost:5173";

  //   const expectedChallenge = req.session.currentChallenge;

  const storedOptions = localStorage.getItem("authOptions");
  let expectedChallenge = "";
  if (!storedOptions) {
    return res.status(400).send({ error: "No registration options found" });
  } else {
    const registrationOptions = JSON.parse(storedOptions) as Options;
    expectedChallenge = registrationOptions.challenge;
  }
  let dbAuthenticator: any;
  const bodyCredIDBuffer = isoBase64URL.toBuffer(body.rawId);
  // "Query the DB" here for an authenticator matching `credentialID`
  const devices = user.devices;
  for (const dev of devices) {
    if (isoUint8Array.areEqual(dev.credentialID, bodyCredIDBuffer)) {
      dbAuthenticator = dev;
      break;
    }
  }

  if (!dbAuthenticator) {
    return res.status(400).send({ error: "No authenticator found" });
  }

  let verification;

  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: expectedOrigin,
      expectedRPID: rpId,
      authenticator: dbAuthenticator,
      requireUserVerification: true,
    };
    verification = await verifyAuthenticationResponse(opts);
  } catch (error: any) {
    console.log("error ", verification ?? error ?? "Unknown error");
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }

  const { verified, authenticationInfo } = verification;
  if (verified) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    dbAuthenticator.counter = authenticationInfo.newCounter;
  }
  return res.send({ verified });
}
