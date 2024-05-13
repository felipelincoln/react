export function CardNftSelectable({
  src,
  tokenId,
  selected,
  disabled,
  onSelect,
}: {
  src?: string;
  tokenId: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}) {
  let cardClass = 'cursor-pointer';

  if (selected) {
    cardClass = 'cursor-pointer outline outline-2 outline-cyan-400';
  }

  if (disabled) {
    cardClass = 'grayscale !cursor-default';
  }

  return (
    <div
      className={`rounded w-24 bg-zinc-800 ${cardClass}`}
      onClick={() => !disabled && onSelect?.()}
    >
      <img src={src} draggable="false" className="w-24 h-24 rounded-t" />
      <div className="h-6 w-24 text-sm text-center text-zinc-200 bg-zinc-800 rounded-b">
        <span className="leading-6">{tokenId}</span>
      </div>
    </div>
  );
}
