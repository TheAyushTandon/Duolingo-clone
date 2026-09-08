import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type QuestsProps = { points: number };

export const Quests = ({ points }: QuestsProps) => {
  return (
    <div className="space-y-4 rounded-xl border-2 border-[var(--border-color)] p-4">
      <div className="flex w-full items-center justify-between space-y-2">
        <h3 className="text-lg font-bold">Quests</h3>

        <Link href="/quests" prefetch>
          <Button size="sm" variant="primaryOutline">
            View all
          </Button>
        </Link>
      </div>

      <ul className="w-full space-y-4">
        {/* Placeholder Quests */}
        <div className="flex w-full items-center gap-x-3 pb-4">
          <Image src="/XP.svg" alt="XP" width={40} height={40} />
          <div className="flex w-full flex-col gap-y-2">
            <p className="text-sm font-bold text-[var(--text-main)]">Earn 20 XP</p>
            <div className="h-2 w-full bg-[var(--border-color)] rounded-full">
               <div className="h-full bg-green-500 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      </ul>
    </div>
  );
};
