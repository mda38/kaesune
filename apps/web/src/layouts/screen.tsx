import type { ReactNode } from "react";
import { BottomNav, type NavigationKey } from "@/layouts/bottom-nav";

type Props = {
  children: ReactNode;
  active?: NavigationKey;
  className?: string;
};

export function Screen({ children, active, className = "" }: Props) {
  return (
    <main
      className={`relative mx-auto h-svh w-full max-w-2xl overflow-y-auto bg-white pb-20 ${className}`}
    >
      <div className="px-6 pt-[68px] pb-7">{children}</div>
      {active && <BottomNav active={active} />}
    </main>
  );
}
