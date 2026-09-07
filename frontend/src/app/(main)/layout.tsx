import React from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { DevModal } from "@/components/dev/DevModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-700 flex flex-col font-sans">
      {/* Fixed Desktop Left Sidebar */}
      <LeftSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Gamification Header */}
        <TopBar />

        {/* Center Canvas + Right Sidebar layout */}
        <div className="flex-1 flex justify-center w-full max-w-7xl mx-auto px-4 md:px-8">
          <main className="flex-1 max-w-2xl w-full">
            {children}
          </main>

          {/* Desktop Right Sidebar */}
          <RightSidebar />
        </div>

        {/* Mobile Navigation Bar */}
        <MobileNav />
      </div>

      {/* Dev Simulator Dialog */}
      <DevModal />
    </div>
  );
}
