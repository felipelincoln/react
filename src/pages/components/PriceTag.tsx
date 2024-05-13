import { ReactNode } from "react";

export function PriceTag({ children }: { children: ReactNode }) {
  return (
    <div className="h-6 w-fit px-2 rounded text-xs text-zinc-200 whitespace-nowrap bg-inherit border border-zinc-700 cursor-default">
      <span className="align-middle">{children}</span>
    </div>
  );
}
