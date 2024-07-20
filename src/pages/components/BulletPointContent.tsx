import { ReactNode } from 'react';

export function BulletPointContent({ children }: { children?: ReactNode }) {
  return (
    <div className="border-l-2 ml-[7px] pl-6 pb-4 border-zinc-700 text-zinc-400 text-sm">
      {children}
    </div>
  );
}
