import { useState } from "react";
import { deviceRegistration } from "./utils/device-registration";
import { verification } from "./utils/device-verification";
import axios from "axios";

function App() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleDelete() {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API}/delete-devices`
      );
      if (response.status === 200) {
        setSuccess("Devices deleted successfully");
        setError("");
      } else {
        setError("Error deleting devices");
        setSuccess("");
      }
    } catch (error: any) {
      setError(error.message ?? "Error deleting devices");
      setSuccess("");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center w-full max-w-sm gap-4 p-8 bg-gray-100">
        <div>Biometric Registration</div>

        <div
          onClick={async () => {
            await deviceRegistration(setError, setSuccess);
          }}
          className="w-full py-2 text-center bg-blue-200 rounded-lg cursor-pointer select-none"
        >
          Register
        </div>
        {/* same button as signup */}
        <div
          onClick={async () => {
            await verification(setError, setSuccess);
          }}
          className="w-full py-2 text-center bg-green-200 rounded-lg cursor-pointer select-none"
        >
          Verify
        </div>
        <div
          onClick={() => {
            handleDelete();
          }}
          className="w-full py-2 text-center bg-red-200 rounded-lg cursor-pointer select-none"
        >
          Delete Devices
        </div>
        <div className="text-xs text-center text-red-500">{error}</div>
        <div className="text-xs text-center text-green-500">{success}</div>
      </div>
    </div>
  );
}

export default App;
