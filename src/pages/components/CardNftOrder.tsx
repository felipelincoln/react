import { useNavigate } from 'react-router-dom';
import { PriceTag, PriceTagClickable } from '.';
import { etherToString } from '../../utils';

export function CardNftOrder({
  contract,
  tokenId,
  symbol,
  src,
  priceToken,
  priceEth,
  canFullfill,
}: {
  contract: string;
  tokenId: number;
  symbol: string;
  src?: string;
  priceToken: string;
  priceEth?: string;
  canFullfill?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div
      className="w-48 h-full group cursor-pointer bg-zinc-800 rounded"
      onClick={() => navigate(`/c/${contract}/order/${tokenId}`)}
    >
      <div className="px-4 py-2 text-sm flex justify-between items-center">
        <span className="h-6 text-base">{tokenId}</span>
        {canFullfill && <PriceTagClickable>Buy</PriceTagClickable>}
      </div>
      <div className="h-48 rounded overflow-hidden">
        {src ? (
          <img
            src={src}
            className="h-48 group-hover:scale-110 transition bg-zinc-700"
            draggable="false"
          />
        ) : (
          <div className="h-48 bg-zinc-700"></div>
        )}
      </div>
      <div className="px-4 py-2 text-sm flex flex-wrap gap-2">
        {priceToken != '0' && <PriceTag>{`${priceToken} ${symbol}`}</PriceTag>}
        {!!priceEth && <PriceTag>{etherToString(BigInt(priceEth))}</PriceTag>}
      </div>
    </div>
  );
}
