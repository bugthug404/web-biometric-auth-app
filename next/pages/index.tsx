import { useState } from "react";
import axios from "axios";
import { authentication } from "./utils/device-authentication";
import { deviceRegistration } from "./utils/device-registration";

function App() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleDelete() {
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
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center w-full max-w-sm gap-4 p-8 bg-gray-900">
        <div>Biometric Registration</div>

        <div
          onClick={async () => {
            await deviceRegistration(setError, setSuccess);
          }}
          className="w-full py-2 text-center bg-blue-900 rounded-lg cursor-pointer select-none"
        >
          Register
        </div>
        {/* same button as signup */}
        <div
          onClick={async () => {
            await authentication(setError, setSuccess);
          }}
          className="w-full py-2 text-center bg-green-900 rounded-lg cursor-pointer select-none"
        >
          Verify
        </div>
        <div
          onClick={() => {
            handleDelete();
          }}
          className="w-full py-2 text-center bg-red-900 rounded-lg cursor-pointer select-none"
        >
          Delete Devices
        </div>
        <div
          onClick={async () => {
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
          }}
          className="w-full py-2 text-center rounded-lg cursor-pointer select-none bg-violet-900"
        >
          Delete User
        </div>
        <div className="text-xs text-center text-red-500">{error}</div>
        <div className="text-xs text-center text-green-500">{success}</div>
      </div>
    </div>
  );
}

export default App;
