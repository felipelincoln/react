import { ReactNode } from "react";
import { ButtonLight } from ".";

export function TagLight({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <ButtonLight onClick={() => onClick?.()}>
      {children}
      <svg
        className="inline h-4 w-4 align-text-bottom box-content pl-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M19 5L5 19M5 5L19 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </ButtonLight>
  );
}
