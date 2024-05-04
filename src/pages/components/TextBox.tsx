import { ReactNode } from 'react';

export function TextBox({ children }: { children?: ReactNode }) {
  return (
    <div
      className={`text-sm rounded bg-transparent leading-8 px-4 w-full outline outline-1 -outline-offset-1 outline-zinc-700`}
    >
      {children}
    </div>
  );
}
