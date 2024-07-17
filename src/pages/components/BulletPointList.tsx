import { ReactNode } from 'react';

export function BulletPointList({ children }: { children?: ReactNode }) {
  return <div className="relative flex flex-col gap-2 bg-zinc-800 p-8 rounded">{children}</div>;
}
