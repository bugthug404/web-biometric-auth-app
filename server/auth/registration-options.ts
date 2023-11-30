import {
  GenerateRegistrationOptionsOpts,
  generateRegistrationOptions,
} from "@simplewebauthn/server";
import { Request, Response } from "express";
import { LocalStorage } from "node-localstorage";
import { Device, User } from "../utils/types";

export async function registerOptions(req: Request, res: Response) {
  const localStorage = new LocalStorage("./scratch");
  console.log("registrationOptions");
  // get user from local storage

  const u = localStorage.getItem("user") ?? undefined;
  let user: User;
  if (!!u) {
    user = JSON.parse(u);
    // We need to convert the regular arrays to Uint8Arrays
    // because regular arrays are easier to store in local storage
    // but the WebAuthn API requires Uint8Arrays
    // You can skip this step if you are storing the data as Uint8Arrays in your database
    const dd: Device[] = user.devices.map((device: Device) => {
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
    // add types from @simplewebauthn/server
    const opts: GenerateRegistrationOptionsOpts = {
      rpID: rpId,
      rpName: "SimpleWebAuthn Example",
      userID: user.id,
      userName: user.username,
      timeout: 60000,
      attestationType: "none",
      /**
       * Passing in a user's list of already-registered authenticator IDs here prevents users from
       * registering the same device multiple times. The authenticator will simply throw an error in
       * the browser if it's asked to perform registration when one of these ID's already resides
       * on it.
       */
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
    // req.session.currentChallenge = options.challenge;
    localStorage.setItem("registrationOptions", JSON.stringify(options));
    // save user to local storage
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error: any) {
    console.log(error ?? "Unknown error");
    res.status(500).json({
      error: error.message || "Unknown error",
    });
  }

  res.json(options);
}
