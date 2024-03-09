import MongoDB from "@/utils/api/mongodb-crud";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const db = new MongoDB();
    const dbConnection = await db.connect();
    res.status(200).json({
      name: "John Doe",

      data: JSON.stringify(dbConnection),
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(200).json({
      name: "John Doe",

      data: error,
    });
  }
}
