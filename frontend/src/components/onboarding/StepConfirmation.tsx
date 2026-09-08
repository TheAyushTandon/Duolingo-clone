import React from "react";
import Image from "next/image";

interface StepConfirmationProps {
  courseName: string;
}

export default function StepConfirmation({ courseName }: StepConfirmationProps) {
  return (
    <div className="w-full flex flex-col items-center mt-20">
      {/* Mascot & Speech Bubble */}
      <div className="flex items-center mb-12 gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <Image
            src="/notepad-duo.svg"
            alt="Duo"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="relative bg-[#37464F] border-2 border-[#37464F] text-white px-6 py-4 rounded-3xl text-lg sm:text-xl font-bold max-w-[320px]">
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#37464F] border-l-2 border-b-2 border-[#37464F] transform rotate-45"
            style={{ borderRadius: "2px" }}
          />
          Since you&apos;re new to {courseName}, you should start with <span className="text-white font-black">Section 1</span>!
        </div>
      </div>
    </div>
  );
}
