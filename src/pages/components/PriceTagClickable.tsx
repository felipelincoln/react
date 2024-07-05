import { ReactNode } from 'react';

export function PriceTagClickable({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="h-6 w-fit px-2 rounded text-sm whitespace-nowrap bg-inherit border border-zinc-700 cursor-pointer"
      onClick={() => onClick?.()}
    >
      <span className="align-middle">{children}</span>
    </div>
  );
}
