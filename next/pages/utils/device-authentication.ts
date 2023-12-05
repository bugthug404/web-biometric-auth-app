import {
  browserSupportsWebAuthn,
  startAuthentication,
} from "@simplewebauthn/browser";
import axios from "axios";

export async function authentication(
  setError: Function,
  setSuccess: Function
): Promise<any> {
  // check if browser supports the WebAuthn API
  if (browserSupportsWebAuthn()) {
    try {
      let data = await axios.get(`/api/authentication-options`);
      const opts = data.data;

      let attResp;
      try {
        attResp = await startAuthentication(opts);
      } catch (error: any) {
        setError(error.message ?? "Something Went Wrong");
        setSuccess("");
      }

      let verificationResp = await axios.post(
        `/api/authentication-confirmation`,
        {
          attResp,
        }
        // this will be used if you are using session based authentication
        // {
        //   withCredentials: true,
        // }
      );

      if (verificationResp && verificationResp.data.verified) {
        setSuccess("Device Authentication Successful");
        setError("");
      } else {
        setError("Something Went Wrong");
        setSuccess("");
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.error ?? error.message ?? "Something Went Wrong"
      );
      setSuccess("");
    }
  } else {
    setError("WebAuthn is not supported in this browser");
  }
}
