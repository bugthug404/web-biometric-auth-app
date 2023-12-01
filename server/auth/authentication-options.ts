import {
  GenerateAuthenticationOptionsOpts,
  generateAuthenticationOptions,
} from "@simplewebauthn/server";
import { Request, Response } from "express";
import { LocalStorage } from "node-localstorage";
import { User } from "../utils/types";

export async function authOptions(req: Request, res: Response) {
  const localStorage = new LocalStorage("./scratch");
  const rpId = "localhost";
  let user: User | null = JSON.parse(localStorage.getItem("user") || "null");

  if (!user?.devices?.length) {
    return res.status(500).json({
      error: "No user found",
    });
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

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user?.devices?.length
      ? user?.devices?.map((dev) => {
          return {
            id: dev.credentialID,
            type: "public-key",
            transports: dev.transports,
          };
        })
      : undefined,
    userVerification: "required",
    rpID: rpId,
  };

  const options = await generateAuthenticationOptions(opts);
  // session.currentChallenge = data.challenge;

  localStorage.setItem("authOptions", JSON.stringify(options));

  return res.json(options);
}
