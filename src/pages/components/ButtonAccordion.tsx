import { ReactNode } from 'react';

export function ButtonAccordion({
  closed,
  onClick,
  children,
}: {
  closed?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  let icon = (
    <path
      d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );

  if (closed) {
    icon = (
      <path
        d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.()}
      className="h-8 w-full px-4 rounded text-sm text-zinc-200 hover:bg-zinc-800"
    >
      <span className="flex justify-between items-center">
        <span className="overflow-hidden text-ellipsis pr-4">{children}</span>
        <svg
          className="inline h-4 w-4 align-text-bottom box-content ml-auto"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </span>
    </button>
  );
}
