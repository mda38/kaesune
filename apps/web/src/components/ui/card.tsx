import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`overflow-hidden border border-black bg-white ${className}`}
    >
      {children}
    </div>
  );
}
