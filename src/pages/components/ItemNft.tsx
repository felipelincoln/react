import { IconNft, PriceTag } from '.';

export function ItemNft({ src, tokenId }: { src?: string; tokenId: number }) {
  return (
    <div className="flex gap-2">
      <IconNft src={src} />
      <PriceTag>{`# ${tokenId}`}</PriceTag>
    </div>
  );
}
