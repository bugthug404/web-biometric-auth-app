import { useState } from "react";
import axios from "axios";
import { authentication } from "../utils/front/device-authentication";
import { deviceRegistration } from "../utils/front/device-registration";
import Link from "next/link";
import { useAtom } from "jotai";
import { globalLoader } from "@/utils/front/open-state";
import Loader from "@/utils/loader";

function App() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useAtom(globalLoader);

  async function handleDelete() {
    setLoading(true);
    try {
      const response = await axios.delete(`/api/delete-devices`);
      console.log(response);
      if (response.status === 200) {
        setSuccess("Devices deleted successfully");
        setError("");
      } else {
        setError("Error deleting devices");
        setSuccess("");
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.error ??
          error.message ??
          "Error deleting devices"
      );
      setSuccess("");
    }
    setLoading(false);
  }

  return (
    <>
      <Loader />
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center w-full max-w-sm gap-4 p-8 bg-gray-900">
          <div>Biometric Registration</div>
          <div className="flex gap-4">
            <Link
              href={
                "https://github.com/bugthug404/web-biometric-auth-app/tree/next"
              }
              target="_blank"
              className="text-xs text-blue-300"
            >
              Github Repo
            </Link>
            <Link href={"documentation"} className="text-xs text-blue-300">
              Documentation
            </Link>
          </div>

          <div
            onClick={async () => {
              await deviceRegistration(setError, setSuccess, setLoading);
            }}
            className="w-full py-2 text-center bg-blue-900 rounded-lg cursor-pointer select-none"
          >
            Register
          </div>
          {/* same button as signup */}
          <div
            onClick={async () => {
              await authentication(setError, setSuccess, setLoading);
            }}
            className="w-full py-2 text-center bg-green-900 rounded-lg cursor-pointer select-none"
          >
            Verify
          </div>
          <div
            onClick={() => {
              setLoading(true);
              handleDelete();
              setLoading(false);
            }}
            className="w-full py-2 text-center bg-red-900 rounded-lg cursor-pointer select-none"
          >
            Delete Devices
          </div>
          <div
            onClick={async () => {
              setLoading(true);
              try {
                await axios.delete("/api/delete-user");
                setError("");
                setSuccess("User deleted successfully");
              } catch (error: any) {
                console.log(error);
                setError(
                  error?.response?.data?.error ??
                    error.message ??
                    "Error deleting user"
                );
                setSuccess("");
              }
              setLoading(false);
            }}
            className="w-full py-2 text-center rounded-lg cursor-pointer select-none bg-violet-900"
          >
            Delete User
          </div>
          <div className="text-xs text-center text-red-500">{error}</div>
          <div className="text-xs text-center text-green-500">{success}</div>
          <div className="text-xs ">
            <div className="font-bold text-center">Tested Devices </div>
            <p className="mt-2">
              <span className="font-bold">1: Touch Id - </span>Tested on Macbook
              M1 Pro
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
