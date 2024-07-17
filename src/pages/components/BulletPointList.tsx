import { ReactNode } from 'react';

export function BulletPointList({ children }: { children?: ReactNode }) {
  return <div className="relative flex flex-col gap-2">{children}</div>;
}
