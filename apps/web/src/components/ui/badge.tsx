import type { ReactNode } from "react";

export function Badge({
  children,
}: {
  children: ReactNode;
  tone?: "neutral" | "yellow" | "green";
}) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-black bg-white px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-black">
      {children}
    </span>
  );
}
