export const runtime = "edge";
import { NextApiRequest, NextApiResponse } from "next";
import {
  GenerateAuthenticationOptionsOpts,
  generateAuthenticationOptions,
} from "@simplewebauthn/server";
import { User } from "../../utils/front/types";
import MongoDB from "../../utils/api/mongodb-crud";
import Cookies from "cookies";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // connect to db
    const db = new MongoDB();
    await db.connect();

    const rpId = "localhost";
    // let user: User | null = JSON.parse(storage["user"] || "null");
    // get user from db
    let user: User = (await db.getUser("user@localhost")) as User;

    if (!user) {
      return res.status(500).json({
        error: "No user found",
      });
    }

    if (!user?.devices?.length) {
      return res.status(500).json({
        error: "No registered devices found",
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

    // storage["authOptions"] = JSON.stringify(options);

    const cookies = new Cookies(req, res);

    const optionsToken = jwt.sign(options, process.env.JWT_SECRET as string);
    cookies.set("authOptions", optionsToken);

    return res.json(options);
  } catch (error: any) {
    console.log("error --- ", error);
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
}
