import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden border border-black bg-white ${className}`}
    >
      {children}
    </div>
  );
}
