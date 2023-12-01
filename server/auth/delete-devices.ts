import { Request, Response } from "express";
import { LocalStorage } from "node-localstorage";

export function deleteDevices(req: Request, res: Response) {
  const localStorage = new LocalStorage("./scratch");
  let u = localStorage.getItem("user");
  if (!u) {
    return res.status(500).json({
      error: "No user found",
    });
  }
  try {
    // remove user devices only
    let user = JSON.parse(u);
    user.devices = [];
    localStorage.setItem("user", JSON.stringify(user));
    return res.status(200).json({
      message: "Devices deleted",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Unknown error",
    });
  }
}
