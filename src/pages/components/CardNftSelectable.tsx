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
  let imgClass = '';

  if (selected) {
    cardClass = 'cursor-pointer outline outline-2 outline-cyan-400';
  }

  if (disabled) {
    cardClass = '!cursor-default';
    imgClass = 'grayscale opacity-50';
  }

  return (
    <div
      className={`rounded w-24 bg-zinc-800 ${cardClass}`}
      onClick={() => !disabled && onSelect?.()}
    >
      {src ? (
        <img src={src} draggable="false" className={`w-24 h-24 rounded-t ${imgClass}`} />
      ) : (
        <div className="w-24 h-24 rounded-t bg-zinc-700"></div>
      )}

      <div className="h-6 w-24 text-sm text-center text-zinc-200 bg-zinc-800 rounded-b">
        <span className="leading-6">{tokenId}</span>
      </div>
    </div>
  );
}
