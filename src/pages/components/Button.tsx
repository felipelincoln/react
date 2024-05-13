import { ReactNode } from "react";

export function Button({
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
        className="group h-8 px-4 rounded text-sm bg-zinc-800 text-zinc-200 whitespace-nowrap disabled:bg-inherit disabled:outline disabled:outline-1 -disabled:outline-offset-1 disabled:outline-zinc-700"
      >
        <span className="animate-pulse rounded inline-block h-4 w-24 my-2 bg-zinc-700 group-disabled:bg-zinc-800"></span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick?.()}
      className="h-8 px-4 rounded text-sm bg-zinc-800 text-zinc-200 whitespace-nowrap hover:bg-zinc-700 disabled:bg-inherit disabled:outline disabled:outline-1 disabled:-outline-offset-1 disabled:outline-zinc-700"
    >
      {children}
    </button>
  );
}
