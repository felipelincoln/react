import { ItemCard } from './ItemCard';

interface ItemsGridProps {
  tokenIds: string[];
}

export function ItemsGrid(props: ItemsGridProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {props.tokenIds.map((tokenId) => (
        <div key={tokenId} className="w-1/6">
          <ItemCard tokenId={tokenId}></ItemCard>
        </div>
      ))}
    </div>
  );
}
