import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import {
  VerifyAuthenticationResponseOpts,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
// import { LocalStorage } from "node-localstorage";
import { Request, Response } from "express";
import { Options, User } from "../utils/types";

declare const myWebauthn: any;

export async function verification(req: Request) {
  // const localStorage = new LocalStorage("./scratch");
  console.log("req --- ", req);
  const body = req.body.attResp;

  // let user: User | null = JSON.parse(localStorage.getItem("user") || "null");
  let user: User | null = await myWebauthn.get("user", "json");

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

  const rpId = process.env.RP_ID;
  const expectedOrigin = process.env.EXPECTED_ORIGIN;

  if (!expectedOrigin) {
    // return res.status(400).send({ error: "Expected origin not found" });
    return new Response("Expected origin not found", { status: 400 });
  }

  //   const expectedChallenge = req.session.currentChallenge;

  // const storedOptions = localStorage.getItem("authOptions");
  const storedOptions = await myWebauthn.get("authOptions", "json");

  let expectedChallenge = "";
  if (!storedOptions) {
    // return res.status(400).send({ error: "No registration options found" });
    return new Response("No registration options found", { status: 400 });
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
    // return res.status(400).send({ error: "No authenticator found" });
    return new Response("No authenticator found", { status: 400 });
  }

  let verification;

  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: expectedOrigin ?? "",
      expectedRPID: rpId ?? "",
      authenticator: dbAuthenticator,
      requireUserVerification: true,
    };
    verification = await verifyAuthenticationResponse(opts);
  } catch (error: any) {
    console.log("error ", verification ?? error ?? "Unknown error");
    // return res.status(500).json({
    //   error: error.message || "Unknown error",
    // });
    return new Response(error.message || "Unknown error", { status: 500 });
  }

  const { verified, authenticationInfo } = verification;
  if (verified && dbAuthenticator?.counter) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    console.log("dbAuthenticator.counter", dbAuthenticator.counter);
    dbAuthenticator.counter = authenticationInfo.newCounter;
  }
  // return res.send({ verified });
  return new Response(JSON.stringify({ verified }));
}
