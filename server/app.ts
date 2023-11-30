import express, { Request, Response } from "express";
import { registerOptions } from "./auth/registration-options";
import { registrationConfirmation } from "./auth/registration-confirmation";
import Cors from "cors";
import fs from "fs";
import https from "https";
// import session from "express-session";
import { verification } from "./auth/authentication-confirmation";
import { authOptions } from "./auth/authentication-options";
import { configDotenv } from "dotenv";
import { deleteDevices } from "./auth/delete-devices";
// import expressStatic from "express-static";

const app = express();
configDotenv();
app.use(
  Cors({
    origin: process.env.EXPECTED_ORIGIN, // replace with your frontend url
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// app.use(expressStatic("public"));

const privateKey = fs.readFileSync("secrets/key.pem", "utf8");
const certificate = fs.readFileSync("secrets/cert.pem", "utf8");

// create a credentials object
const credentials = { key: privateKey, cert: certificate };

// create the HTTPS server
const httpsServer = https.createServer(credentials, app);

// add json middleware for parsing json body in requests
app.use(express.json());

// add a simple route
app.get("/", (req: Request, res: Response) =>
  res.status(200).send({
    data: `server says : get request on time : ${new Date().getTime()}`,
  })
);

// add the routes for registration and verification
app.get("/registration-options", registerOptions);
// app.post("/registration-confirmation", registrationConfirmation);
// app.get("/authentication-options", authOptions);
// app.post("/authentication-confirmation", verification);
// app.delete("/delete-devices", deleteDevices);

// listen on the desired port
const isLoaded = process.env.EXPECTED_ORIGIN && process.env.RP_ID;
httpsServer.listen(3002, () => {
  console.log("HTTPS Server running on port 3002");
  console.log(
    "environment variables status :",
    !!isLoaded ? "loaded" : "not loaded"
  );
});
