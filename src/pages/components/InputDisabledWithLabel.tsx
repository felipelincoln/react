import { ReactNode } from "react";

export function InputDisabledWithLabel({
  value,
  label,
}: {
  value: string | number;
  label: ReactNode;
}) {
  return (
    <div className="flex w-52">
      <input
        disabled
        value={value}
        className="w-full rounded-l leading-8 h-8 px-4 text-zinc-400 border-zinc-700 overflow-hidden text-ellipsis !ring-0 focus:border-zinc-500 focus:text-zinc-200 disabled:bg-zinc-800"
        type="text"
      />
      <div className="px-4 bg-zinc-700 rounded-r text-center leading-8 text-nowrap">
        {label}
      </div>
    </div>
  );
}
