import express, { Request, Response } from "express";
import { registerOptions } from "./auth/registration-options";
import { registrationConfirmation } from "./auth/registration-confirmation";
import Cors from "cors";
import fs from "fs";
import https from "https";
// import session from "express-session";
import { authenticationConfirmation } from "./auth/authentication-confirmation";
import { authOptions } from "./auth/authentication-options";
import { deleteDevices } from "./auth/delete-devices";

const app = express();

app.use(
  Cors({
    origin: "https://localhost:5173", // replace with your frontend url
    // credentials: true, // enable set cookie if using session based authentication
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// app.use(
//   session({
//     secret: "123456789",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true },
//   })
// );

// read the certificate and private key from the filesystem
// this is required to use HTTPS in localhost only
// in production, you will need to get a certificate from a trusted CA
// and use it instead
// to generate a self-signed certificate, run the following command in the terminal
// openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

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
app.post("/registration-confirmation", registrationConfirmation);
app.get("/authentication-options", authOptions);
app.post("/authentication-confirmation", authenticationConfirmation);
app.delete("/delete-devices", deleteDevices);

// listen on the desired port
httpsServer.listen(3002, () => {
  console.log("HTTPS Server running on port 3002");
});
