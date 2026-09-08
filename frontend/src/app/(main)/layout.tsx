"use client";

import type { PropsWithChildren } from "react";

import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { MobileFooter } from "@/components/mobile-footer";
import { DevModal } from "@/components/dev/DevModal";
import { AuthGuard } from "@/components/auth/AuthGuard";

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <AuthGuard>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <main className="h-full pt-[50px] lg:pl-[256px] lg:pt-0 pb-[80px] lg:pb-0">
        <div className="mx-auto h-full max-w-[1056px] pt-6">{children}</div>
      </main>
      <MobileFooter />
      <DevModal />
    </AuthGuard>
  );
};

export default MainLayout;
