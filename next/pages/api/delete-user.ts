import { NextApiRequest, NextApiResponse } from "next";
import MongoDB from "../../utils/api/mongodb-crud";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if the method is DELETE
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).end("Method Not Allowed");
  }

  const db = new MongoDB();
  await db.connect();

  try {
    // check if user exists
    const user = await db.getUser("user@localhost");

    if (!user) {
      return res.status(500).json({
        error: "No user found",
      });
    }

    // delete user
    const result = await db.delete({ username: "user@localhost" });

    if (result === 0) {
      return res.status(500).json({
        error: "Unable to delete user",
      });
    } else {
      return res.status(200).json({
        message: "User deleted",
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
}
