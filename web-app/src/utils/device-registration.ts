import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";
import axios from "axios";

export async function deviceRegistration(
  setError: Function,
  setSuccess: Function
) {
  // check if browser supports the WebAuthn API
  if (browserSupportsWebAuthn()) {
    try {
      let data = await axios.get(`https://localhost:3002/registration-options`);
      const opts = data.data;

      let attResp;
      try {
        attResp = await startRegistration(opts);
      } catch (error: any) {
        setError(error.message ?? "Something Went Wrong");
        setSuccess("");
      }

      let verificationResp = await axios.post(
        `https://localhost:3002/registration-confirmation`,
        {
          attResp,
        }
        // this will be used if you are using session based authentication
        // {
        //   withCredentials: true,
        // }
      );

      if (verificationResp && verificationResp.data.verified) {
        setSuccess("Device Registered Successfully");
        setError("");
      } else {
        setError("Something Went Wrong2");
        setSuccess("");
      }
    } catch (error: any) {
      setError(error.message ?? "Something Went Wrong");
      setSuccess("");
    }
  } else {
    setError("WebAuthn is not supported in this browser");
  }
}
