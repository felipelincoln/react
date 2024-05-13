import { IconEth, PriceTag } from ".";
import { etherToString } from "../../utils";

export function ItemEth({ value }: { value: string }) {
  return (
    <div className="flex gap-2">
      <IconEth />
      <PriceTag>{etherToString(BigInt(value))}</PriceTag>
    </div>
  );
}
