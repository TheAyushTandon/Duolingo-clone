import { MobileSidebar } from "./mobile-sidebar";
import { ThemeToggle } from "./theme-toggle";

export const MobileHeader = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center justify-between border-b bg-green-500 px-4 lg:hidden">
      <MobileSidebar />
      <div className="flex items-center text-white">
        <ThemeToggle />
      </div>
    </nav>
  );
};
