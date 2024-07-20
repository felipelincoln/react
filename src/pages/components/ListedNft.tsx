import { IconNftLarge, PriceTagClickable } from '.';
import { etherToString } from '../../utils';

export function ListedNft({
  tokenId,
  symbol,
  name,
  src,
  onClick,
  tokenPrice,
  ethPrice,
}: {
  tokenId: number;
  symbol: string;
  name: string;
  src?: string;
  tokenPrice: string;
  ethPrice?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex gap-2 items-end ${!!onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.()}
    >
      <IconNftLarge src={src} />
      <div className="flex-grow max-w-64 overflow-hidden">
        <div>{`${name} #${tokenId}`}</div>
        <div className="flex gap-2 *:max-w-28 *:overflow-x-hidden *:text-ellipsis">
          {+tokenPrice > 0 && <PriceTagClickable>{`${tokenPrice} ${symbol}`}</PriceTagClickable>}
          {ethPrice && (
            <PriceTagClickable>{etherToString(BigInt(ethPrice), true)}</PriceTagClickable>
          )}
        </div>
      </div>
    </div>
  );
}
