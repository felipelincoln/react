import { ReactNode } from 'react';

export function BulletPointContent({ children }: { children?: ReactNode }) {
  return <div className="border-l-2 ml-[7px] pl-6 py-2 border-zinc-700">{children}</div>;
}
