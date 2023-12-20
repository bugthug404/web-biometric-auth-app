import { useAtom } from "jotai";
import React from "react";
import { globalLoader } from "./front/open-state";

export default function Loader() {
  const [loading, setLoading] = useAtom(globalLoader);
  return (
    <>
      {loading && (
        <div
          className={`fixed top-0 left-0 bg-black/80 h-screen w-full gap-4 flex flex-col items-center justify-center`}
        >
          <p>Loading....</p>
          <button
            onClick={() => {
              setLoading(false);
            }}
            className="px-2 py-1 bg-red-500"
          >
            close
          </button>
        </div>
      )}
    </>
  );
}
