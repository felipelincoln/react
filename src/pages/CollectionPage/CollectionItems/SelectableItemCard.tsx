import { ItemCard } from './ItemCard';

interface SelectableItemCardProps {
  tokenId: string;
  isSelected: boolean;
  onSelect: Function;
}

export function SelectableItemCard(props: SelectableItemCardProps) {
  return (
    <div
      className={
        props.isSelected ? 'w-1/6 p-2 cursor-pointer bg-blue-500' : 'w-1/6 p-2 cursor-pointer'
      }
      onClick={() => props.onSelect()}
    >
      <ItemCard tokenId={props.tokenId}></ItemCard>
    </div>
  );
}
