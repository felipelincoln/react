import { ReactNode } from 'react';

export function Checkbox({
  checked,
  label,
  onClick,
}: {
  checked?: boolean;
  label: ReactNode;
  onClick?: Function;
}) {
  let id = crypto.randomUUID();
  return (
    <div className="flex items-center text-zinc-400 hover:text-zinc-200">
      <input
        id={id}
        checked={!!checked}
        onChange={() => onClick?.()}
        type="checkbox"
        className="peer hidden"
      />
      <label
        htmlFor={id}
        tabIndex={0}
        className="text-sm flex-grow cursor-pointer text-nowrap before:inline-block before:w-4 before:h-4 before:mr-2 before:-mt-px before:mb-px before:align-sub before:rounded before:border-none before:bg-zinc-700 before:hover:bg-zinc-600 peer-checked:before:bg-cyan-400"
      >
        {label}
      </label>
    </div>
  );
}
