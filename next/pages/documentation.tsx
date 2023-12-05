import Link from "next/link";
import React from "react";

export default function Documentation() {
  return (
    <div className="flex flex-col items-center w-full h-screen">
      <div className="w-full max-w-3xl px-2 space-x-4">
        <Link href={"/"} className="py-2">
          Home
        </Link>
        <Link
          target="_blank"
          href={
            "https://docs.google.com/document/d/1ayRNsHuxopQ0KTiOuyjIVbZPgvYk8h7Kb4hZS6gah0w/edit?usp=sharing"
          }
          className="py-2"
        >
          View in docs
        </Link>
      </div>
      <iframe
        src="https://docs.google.com/document/d/e/2PACX-1vRgJbSPI6CR7i5p_Qw6NE-Sqo27N6FpYHTLxCHsF1NO8X2dQoTz4GqKCd9FR5OhOVp5SVFTgylEAZ_i/pub?embedded=true"
        className="w-full h-full max-w-3xl"
      ></iframe>
    </div>
  );
}
