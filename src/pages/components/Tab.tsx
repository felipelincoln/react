import { ReactNode } from "react";

export function Tab({
  hidden,
  children,
}: {
  hidden: boolean;
  children: ReactNode;
}) {
  const display = hidden ? "translate-x-96" : "z-10";
  const containerZIndex = hidden ? "-z-20" : "";

  return (
    <div className={`absolute right-0 top-0 w-96 h-screen ${containerZIndex}`}>
      <div
        className={`fixed flex flex-col h-full w-96 box-content border-l-2 border-zinc-800 bg-zinc-900 transition ease-in-out delay-0 ${display}`}
      >
        {children}
      </div>
    </div>
  );
}
