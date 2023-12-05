// pages/api/registerOptions.ts
import { NextApiRequest, NextApiResponse } from "next";
import {
  GenerateRegistrationOptionsOpts,
  generateRegistrationOptions,
} from "@simplewebauthn/server";
import { Device, User } from "../utils/types";
import jwt from "jsonwebtoken";
import Cookies from "cookies";
import MongoDB from "./mongodb-crud";

// In-memory storage
const storage: { [key: string]: any } = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("api : registerOptions.ts");
  const db = new MongoDB();
  const connection = await db.connect();

  const cookies = new Cookies(req, res);
  const token = cookies.get("session");
  // const u = storage["user"];
  let user: User = (await db.getUser("user@localhost")) as User;
  console.log("user --- ", user, typeof user);
  if (user) {
    // user = JSON.parse(user);
    const dd: Device[] = user.devices.map((d) => {
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
      devices: dd,
    };
  } else {
    user = {
      id: "internalUserId",
      username: "user@localhost",
      devices: [],
    };
  }
  let options;

  const rpId = "localhost";
  if (!rpId) {
    throw new Error("No RP_ID configured");
  }
  try {
    const devices = user.devices;
    const opts: GenerateRegistrationOptionsOpts = {
      rpID: rpId,
      rpName: "SimpleWebAuthn Example",
      userID: user.id,
      userName: user.username,
      timeout: 60000,
      attestationType: "none",
      excludeCredentials: devices.map((dev) => {
        let id = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          id[i] = dev.credentialID[i] || 0;
        }
        return {
          id: id,
          type: "public-key",
          transports: dev.transports,
        };
      }),
      authenticatorSelection: {
        residentKey: "discouraged",
      },
      supportedAlgorithmIDs: [-7, -257],
    };
    console.log("opts --- ", opts.excludeCredentials);

    options = await generateRegistrationOptions(opts);
    const optionsToken = jwt.sign(options, "your-secret-key");
    cookies.set("options", optionsToken);

    storage["user"] = JSON.stringify(user);
    const excludeCredentials = opts.excludeCredentials?.map((cred) => {
      return JSON.stringify(cred);
    });
    db.update({ id: user.id }, { ...user, devices: excludeCredentials });
    // { ...user, devices: JSON.stringify(opts.excludeCredentials) }
  } catch (error: any) {
    console.log(error ?? "Unknown error");
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }

  return res.json(options);
}
