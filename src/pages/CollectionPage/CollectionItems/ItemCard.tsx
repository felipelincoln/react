import { useContext } from 'react';
import { CollectionContext } from '../../App';

interface ItemCardProps {
  tokenId: string;
}

export function ItemCard(props: ItemCardProps) {
  const collection = useContext(CollectionContext);

  return (
    <div className="w-full" key={props.tokenId}>
      <img src={`/${collection.key}/${props.tokenId}.png`} />
      <div className="text-center">{props.tokenId}</div>
    </div>
  );
}
