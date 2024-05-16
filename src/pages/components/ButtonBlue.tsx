import { ReactNode } from 'react';

export function ButtonBlue({
  children,
  disabled,
  loading,
  onClick,
}: {
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) {
  if (loading) {
    return (
      <button
        type="button"
        disabled={disabled}
        className="group h-8 px-4 w-full rounded text-sm bg-cyan-400 text-zinc-950 whitespace-nowrap disabled:bg-inherit disabled:outline disabled:outline-1 -disabled:outline-offset-1 disabled:outline-cyan-500 disabled:text-cyan-500"
      >
        <span className="animate-pulse inline-block h-4 w-24 my-2 bg-cyan-300 group-disabled:bg-cyan-400"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick?.()}
      className="h-8 px-4 w-full rounded text-sm bg-cyan-400 font-medium text-zinc-950 whitespace-nowrap hover:bg-cyan-300 disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-cyan-500 disabled:text-cyan-500"
    >
      {children}
    </button>
  );
}
