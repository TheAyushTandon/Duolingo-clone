"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type SidebarItemProps = {
  label: string;
  iconSrc?: string;
  icon?: React.ReactNode;
  href: string;
};

export const SidebarItem = ({ label, iconSrc, icon, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      variant={isActive ? "sidebarOutline" : "sidebar"}
      className="h-[52px] justify-start"
      asChild
    >
      <Link href={href} prefetch>
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={label}
            className="mr-5"
            height={32}
            width={32}
          />
        ) : (
          <span className="mr-5 flex h-8 w-8 items-center justify-center">{icon}</span>
        )}
        {label}
      </Link>
    </Button>
  );
};
