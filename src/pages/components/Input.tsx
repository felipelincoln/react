export function Input({
  disabled,
  value,
  type,
  onChange,
}: {
  disabled?: boolean;
  type?: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <input
      disabled={disabled}
      value={value}
      className="rounded bg-transparent leading-8 h-8 px-4 w-full text-zinc-400 border-zinc-700 !ring-0 focus:border-zinc-500 focus:text-zinc-200 disabled:bg-zinc-800"
      type={type}
      onChange={(e) => onChange?.(e)}
    />
  );
}
