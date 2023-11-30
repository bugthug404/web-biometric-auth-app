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
      let data = await axios.get(
        `${import.meta.env.VITE_API}/registration-options`
      );
      const opts = data.data;

      let attResp;
      try {
        attResp = await startRegistration(opts);
      } catch (error: any) {
        setError(error.message ?? "Something Went Wrong");
        setSuccess("");
      }

      let verificationResp = await axios.post(
        `${import.meta.env.VITE_API}/registration-confirmation`,
        {
          attResp,
        }
        // this will be used if you are using session based authentication
        // {
        //   withCredentials: true,
        // }
      );

      if (verificationResp.data && verificationResp.data.verified) {
        setSuccess("Device Registered Successfully");
        setError("");
      } else {
        setError("Something Went Wrong");
        setSuccess("");
      }
    } catch (error: any) {
      console.log("error ", error);
      setError(
        error?.response?.data?.error ?? error?.message ?? "Something Went Wrong"
      );
      setSuccess("");
    }
  } else {
    setError("WebAuthn is not supported in this browser");
  }
}
