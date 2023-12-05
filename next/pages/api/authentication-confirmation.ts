import { NextApiRequest, NextApiResponse } from "next";
import {
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { User } from "../../utils/front/types";
import MongoDB from "../../utils/api/mongodb-crud";
import Cookies from "cookies";
import jwt from "jsonwebtoken";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";

// In-memory storage
const storage: { [key: string]: any } = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = req.body.attResp;
    // connect to db
    const db = new MongoDB();
    const connection = await db.connect();

    const rpId = "localhost";
    //   let user: User | null = JSON.parse(storage["user"] || "null");

    // get user from db
    let user: User = (await db.getUser("user@localhost")) as User;

    if (!user?.devices?.length) {
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
      console.log("confirmation devices --- ", devices);
      user = {
        ...user,
        devices,
      };
    }

    const expectedOrigin = process.env.BASE_URL as string;

    const cookies = new Cookies(req, res);
    const optionsToken = cookies.get("authOptions");

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

    let dbAuthenticator: any;
    // const bodyCredIDBuffer = body.rawId;
    const bodyCredIDBuffer = Uint8Array.from(Buffer.from(body.rawId, "base64"));
    const devices = user.devices;
    for (const dev of devices) {
      //   console.log("dev.credentialID --- ", dev.credentialID);
      //   console.log("bodyCredIDBuffer --- ", bodyCredIDBuffer);
      //   dev.credentialID ---  Uint8Array(32) [
      //   194, 72,  98,  55,  25, 117, 176, 229,
      //   8, 25, 163, 124,  10, 210, 197, 101,
      //   164, 68,  54, 168,  10, 210, 156, 175,
      //   97, 35, 152, 140, 144,   1, 236, 221
      //   ]
      //   bodyCredIDBuffer ---  wkhiNxl1sOUIGaN8CtLFZaRENqgK0pyvYSOYjJAB7N0
      //   compare this to the registration confirmation
      const bb = dev.credentialID.every(
        (value, index) => value === bodyCredIDBuffer[index]
      );
      //   const bb = isoUint8Array.areEqual(dev.credentialID, bodyCredIDBuffer);
      console.log("bb --- ", bb);
      if (bb) {
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
      dbAuthenticator.counter = authenticationInfo.newCounter;
    }
    return res.send({ verified });
  } catch (error: any) {
    console.log("error --- ", error);
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
}
