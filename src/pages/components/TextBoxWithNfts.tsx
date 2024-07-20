import { ItemNft } from '.';

export function TextBoxWithNfts({
  value,
  tokens,
  cols,
}: {
  value: string;
  tokens: [number, string | undefined][];
  cols?: number;
}) {
  const textBoxRounded = tokens.length > 0 ? 'rounded-t' : 'rounded';

  return (
    <div>
      <input
        disabled
        value={value}
        className={`${textBoxRounded} text-sm bg-transparent leading-8 h-8 px-4 w-full border-zinc-700`}
        type="text"
      />
      {tokens.length > 0 && (
        <div
          className={`px-4 py-2 grid grid-cols-${cols ?? 2} gap-x-4 gap-y-2 rounded-b border border-t-0 border-zinc-700`}
        >
          {tokens.map((token) => (
            <div key={token[0]} className="">
              <ItemNft src={token[1]} tokenId={token[0]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
