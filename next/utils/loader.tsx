import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { globalLoader } from "./front/open-state";

export default function Loader() {
  const [loading, setLoading] = useAtom(globalLoader);

  const [show, setShow] = React.useState(false);

  function handleShow() {
    setTimeout(() => {
      setShow(true);
    }, 3000);
  }

  useEffect(() => {
    if (loading) {
      console.log("loading");
      handleShow();
    }
    setShow(false);
  }, [loading]);

  return (
    <>
      {loading && (
        <div
          className={`fixed top-0 text-center left-0 bg-black/80 h-screen w-full flex flex-col items-center justify-center`}
        >
          <div
            className="flex flex-col gap-4 w-full"
            style={{ position: "relative" }}
          >
            <div
              style={{
                opacity: show ? 1 : 0,
                position: show ? "absolute" : undefined,
                left: "50%",
                transform: "translateX(-50%)",
                top: show ? "-52px" : "-70px",
                transition: "all 0.5s ease-in-out",
                transitionDuration: "0.5s",
                fontSize: "12px",
              }}
            >
              Backend guy might sleeping 💤💤
              <br /> Might take some time to wake up
            </div>
            <p>Loading....</p>
            <button
              onClick={() => {
                setLoading(false);
              }}
              className="px-2 py-1 bg-blue-700"
            >
              close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
