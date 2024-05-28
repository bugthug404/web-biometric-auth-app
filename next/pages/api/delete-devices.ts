import { NextApiRequest, NextApiResponse } from "next";
import MongoDB from "../../utils/api/mongodb-crud";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userMail = "karan@mail.com";

  // Check if the method is DELETE
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).end("Method Not Allowed");
  }

  const db = new MongoDB();
  await db.connect();

  try {
    // check if user exists

    const user = await db.getUser(userMail);

    if (!user) {
      return res.status(500).json({
        error: "No user found",
      });
    }

    // check if user has devices

    if (!user.devices?.length) {
      return res.status(500).json({
        error: "No devices found",
      });
    }

    // remove user devices only
    const result = await db.update(
      { username: userMail }, // replace with the actual condition to find the user
      { devices: [] }
    );

    if (result === 0) {
      return res.status(500).json({
        error: "Unable to delete devices",
      });
    } else {
      return res.status(200).json({
        message: "Devices deleted",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
}
