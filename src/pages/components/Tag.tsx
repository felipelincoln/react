import { Button } from ".";

export function Tag({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <Button onClick={() => onClick()}>
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
    </Button>
  );
}
