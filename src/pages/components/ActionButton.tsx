import { ReactNode } from 'react';

export function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: Function;
}) {
  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick?.()}
      className="h-8 w-full px-4 rounded bg-cyan-400 text-zinc-900 font-medium whitespace-nowrap hover:bg-cyan-300 disabled:text-zinc-400 disabled:font-normal disabled:bg-inherit disabled:border disabled:border-zinc-700"
    >
      {children}
    </button>
  );
}
