import type { PropsWithChildren } from "react";

export const StickyWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="sticky top-6 hidden w-[368px] self-start lg:block">
      <div className="flex flex-col gap-y-4">
        {children}
      </div>
    </div>
  );
};
