import { ReactNode } from 'react';

export function ButtonRed({
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
        className="group h-8 px-4 rounded text-sm bg-red-400 text-zinc-950 whitespace-nowrap disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-zinc-700 disabled:text-zinc-200"
      >
        <span className="animate-pulse inline-block h-4 w-24 my-2 bg-red-300 group-disabled:bg-red-400"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!!disabled}
      onClick={() => onClick?.()}
      className="h-8 px-4 rounded text-sm bg-red-400 font-medium text-zinc-950 whitespace-nowrap hover:bg-red-300 disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-zinc-700 disabled:text-zinc-200 disabled:font-normal"
    >
      {children}
    </button>
  );
}
