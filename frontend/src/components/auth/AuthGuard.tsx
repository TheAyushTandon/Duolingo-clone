"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredToken } from "@/lib/api";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsAuthenticated(false);
      // Redirect to landing page with auth trigger
      router.replace(`/?auth=login&redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  // While checking authentication state, prevent content flash
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#131F24]">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/duolingo.svg"
            alt="Duolingo"
            className="h-10 w-auto animate-pulse"
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
