import type { ReactNode } from "react";

export function Heading({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold text-black">{eyebrow}</p>
        )}
        <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-[-0.06em] text-black">
          {title}
        </h1>
      </div>
      {right}
    </header>
  );
}
