import { NotebookText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type UnitBannerProps = {
  title: string;
  description: string;
};

export const UnitBanner = ({ title, description }: UnitBannerProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-2xl bg-green-500 p-5 text-white shadow-sm font-din">
      <div className="space-y-1.5">
        <h3 className="text-2xl font-black !text-white">{title}</h3>
        <p className="text-base font-bold text-white/95">{description}</p>
      </div>

      <Link href="/lesson" prefetch>
        <Button
          size="lg"
          variant="secondary"
          className="hidden border-2 border-b-4 active:border-b-2 xl:flex"
        >
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>
    </div>
  );
};
