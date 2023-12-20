import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";
import axios from "axios";

export async function deviceRegistration(
  setError: Function,
  setSuccess: Function,
  setLoader: Function
) {
  setLoader(true);
  // check if browser supports the WebAuthn API
  if (browserSupportsWebAuthn()) {
    try {
      let data = await axios.get(`/api/registration-options`);
      const opts = data.data;

      let attResp;
      setLoader(false);
      attResp = await startRegistration(opts);
      setLoader(true);
      let verificationResp = await axios.post(
        `/api/registration-confirmation`,
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
      setLoader(false);
    } catch (error: any) {
      console.log("error --- ", error);
      if (
        error.message === "The operation either timed out or was not allowed."
      ) {
        setError("Device Registration Failed");
      } else {
        setError(
          error?.response?.data?.error ??
            error.message ??
            "Something Went Wrong"
        );
      }
      setSuccess("");
    }
  } else {
    setError("WebAuthn is not supported in this browser");
  }
  setLoader(false);
}
