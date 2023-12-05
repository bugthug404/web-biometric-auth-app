// pages/api/registrationConfirmation.ts
import { NextApiRequest, NextApiResponse } from "next";
import {
  // @ts-ignore
  isoUint8Array,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { User, Device } from "../utils/types";
import jwt from "jsonwebtoken";
import Cookies from "cookies";
import MongoDB from "./mongodb-crud";

// In-memory storage
const storage: { [key: string]: any } = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("api : registrationConfirmation.ts");
  // connect to db
  const db = new MongoDB();
  const connection = await db.connect();

  // let user: User | null = JSON.parse(storage["user"] || "null");
  // get user from db

  let user: User = (await db.getUser("user@localhost")) as User;

  console.log("user --- ", user);

  if (!user) {
    return res.status(500).json({
      error: "No user found",
    });
  } else {
    const devices = user.devices.map((d) => {
      const device = JSON.parse(d as any);
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
  //   const options = JSON.parse(storage["registrationOptions"] || "{}");
  const cookies = new Cookies(req, res);
  const optionsToken = cookies.get("options");
  let options: any;

  if (optionsToken) {
    try {
      options = jwt.verify(optionsToken, process.env.JWT_SECRET as string);
      console.log("options --- ", options);
    } catch (err: any) {
      console.log("err --- ", err);
      res.status(500).json({
        error: err.message || "Unknown error",
      });
      // Handle error
    }
  }
  const expectedChallenge = options?.challenge;

  let verification;
  try {
    const opts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: "https://localhost:3000",
      expectedRPID: "localhost",
      requireUserVerification: true,
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }

  const { verified, registrationInfo } = verification;
  let existingDevice;
  let newDevice;
  if (verified && registrationInfo) {
    try {
      const { credentialPublicKey, credentialID, counter } = registrationInfo;

      existingDevice = user?.devices?.find((device: Device) => {
        return isoUint8Array.areEqual(device.credentialID, credentialID);
      });

      if (!existingDevice) {
        newDevice = {
          credentialPublicKey: credentialPublicKey,
          credentialID: credentialID,
          counter,
          transports: body?.response?.transports ?? [],
        };
      }
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || "Unknown error",
      });
    }
  }

  if (newDevice) {
    user.devices.push(JSON.stringify(newDevice) as any);
    console.log("new user ---- ", user, newDevice);
    db.update({ id: user.id }, user);

    // storage["user"] = JSON.stringify(user);
  }
  return res.json({ verified, registrationInfo, newDevice });
}
