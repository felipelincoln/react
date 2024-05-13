import { ReactNode } from "react";

export function Tootltip({ children }: { children: ReactNode }) {
  return (
    <div
      data-text={children}
      className="relative hover:after:content-[attr(data-text)] hover:after:absolute hover:after:left-8 hover:after:top-0 hover:after:p-4 hover:after:w-40 hover:after:rounded hover:after:shadow hover:after:bg-zinc-800 hover:after:text-zinc-400 hover:after:text-sm"
    >
      <svg
        className="h-4 w-4 text-zinc-400 hover:text-zinc-200"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.992 8H12.001"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
