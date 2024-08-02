import { IconCurrency, PriceTag } from '.';
import { etherToString } from '../../utils';

export function ItemEth({ value }: { value: string }) {
  return (
    <div className="flex gap-2">
      <IconCurrency />
      <PriceTag>{etherToString(BigInt(value))}</PriceTag>
    </div>
  );
}
