import { useState } from "react";
import { deviceRegistration } from "../../next/pages/utils/device-registration";
import axios from "axios";

export default function Signup() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegistration() {
    await deviceRegistration(setError, setSuccess);
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center w-full max-w-sm gap-4 p-8 bg-gray-100">
        <div>Biometric Registration</div>

        <div
          onClick={() => {
            handleRegistration();
          }}
          className="w-full py-2 text-center bg-blue-200 rounded-lg cursor-pointer select-none"
        >
          Signup
        </div>
        {/* same button as signup */}
        <div
          onClick={async () => {
            let verificationResp = await axios.post(
              `https://localhost:3001/registration-confirmation`,
              {
                attResp: "attResp",
                deviceName: "dn",
                name: "name",
              }
            );
            console.log(verificationResp);
          }}
          className="w-full py-2 text-center bg-blue-200 rounded-lg cursor-pointer select-none"
        >
          test
        </div>
        <a href="/login" className="w-full text-xs text-right text-blue-500">
          Already registered?
        </a>
        <div className="text-xs text-center text-red-500">{error}</div>
        <div className="text-xs text-center text-green-500">{success}</div>
      </div>
    </div>
  );
}
