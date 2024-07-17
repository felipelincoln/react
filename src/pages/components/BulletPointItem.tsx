import { ReactNode } from 'react';

export function BulletPointItem({
  children,
  ping,
  disabled,
}: {
  children?: ReactNode;
  ping?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex gap-4 items-center text-zinc-400">
        <div className="h-4 w-4 bg-zinc-700 rounded-full"></div>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      <div className="h-4 w-4 relative">
        {ping && (
          <div className="h-4 w-4 animate-ping bg-cyan-400 rounded-full absolute opacity-25"></div>
        )}
        <div className="h-2 w-2 m-1 bg-cyan-400 rounded-full absolute"></div>
      </div>
      <div>{children}</div>
    </div>
  );
}
