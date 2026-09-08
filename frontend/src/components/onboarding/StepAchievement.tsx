import React from "react";
import Image from "next/image";
import { MessageSquare, BookOpen, Clock } from "lucide-react";

export default function StepAchievement() {
  return (
    <div className="w-full flex flex-col items-center mt-4">
      {/* Mascot & Speech Bubble */}
      <div className="flex items-center self-start mb-8 ml-2 sm:ml-6 gap-3">
        <div className="relative w-24 h-24 shrink-0">
          <Image
            src="/notepad-duo.svg"
            alt="Duo"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="relative bg-[#37464F] border-2 border-[#37464F] text-white px-5 py-3 rounded-2xl text-base sm:text-lg font-bold">
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#37464F] border-l-2 border-b-2 border-[#37464F] transform rotate-45"
            style={{ borderRadius: "2px" }}
          />
          Here&apos;s what you can achieve!
        </div>
      </div>

      {/* Achievement Blocks */}
      <div className="w-full max-w-[500px] flex flex-col">
        {/* Block 1 */}
        <div className="flex items-center py-5 border-b-2 border-[#37464F]">
          <div className="w-12 h-12 flex items-center justify-center bg-purple-500 rounded-xl mr-5 shrink-0">
            <MessageSquare className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white">Converse with confidence</span>
            <span className="text-[#9ca3af] font-medium text-sm">Stress-free speaking and listening exercises</span>
          </div>
        </div>

        {/* Block 2 */}
        <div className="flex items-center py-5 border-b-2 border-[#37464F]">
          <div className="w-12 h-12 flex items-center justify-center bg-sky-500 rounded-xl mr-5 shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white">Build a large vocabulary</span>
            <span className="text-[#9ca3af] font-medium text-sm">Common words and practical phrases</span>
          </div>
        </div>

        {/* Block 3 */}
        <div className="flex items-center py-5">
          <div className="w-12 h-12 flex items-center justify-center bg-orange-500 rounded-xl mr-5 shrink-0">
            <Clock className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white">Develop a learning habit</span>
            <span className="text-[#9ca3af] font-medium text-sm">Smart reminders, fun challenges, and more</span>
          </div>
        </div>
      </div>
    </div>
  );
}
