import { useRef, useState } from "react";
import { deviceRegistration } from "../../next/pages/utils/device-registration";
import { startAuthentication } from "@simplewebauthn/browser";
import { useNavigate } from "react-router-dom";
import { noPassAuthOptionPatient } from "../../next/pages/utils/registration-options";

function Login() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!emailRef.current?.value) {
      setError("Please enter your email");
      return;
    }
    const resp = await noPassAuthOptionPatient({
      email: emailRef.current.value,
    });

    let asseResp;
    try {
      const opts = resp.options;
      asseResp = await startAuthentication(opts);
    } catch (error: any) {
      throw new Error(error ?? "Something went wrong");
    }
    try {
      // setSuccessMsgbio("Device verification success!");
    } catch (error) {
      console.log(error);
      // setErrorsbio(error?.message ?? "Something went wrong");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center w-full max-w-sm gap-4 p-8 bg-gray-100">
        <div>Biometric Login</div>
        <input
          type="text"
          placeholder="Email"
          className="w-full p-2 rounded-lg outline-none"
        />
        <div
          onClick={() => {
            handleSubmit();
          }}
          ref={emailRef}
          className="w-full py-2 text-center bg-blue-200 rounded-lg cursor-pointer select-none"
        >
          Login
        </div>
      </div>
    </div>
  );
}

export default Login;
