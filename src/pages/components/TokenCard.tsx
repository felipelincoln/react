import { useContext } from 'react';
import { CollectionContext, UserTokenIdsContext } from '../App';

interface TokenCardProps {
  tokenId: string;
}

export function TokenCard(props: TokenCardProps) {
  const collection = useContext(CollectionContext);
  const userTokenIds = useContext(UserTokenIdsContext);

  const isCollected = userTokenIds.includes(props.tokenId);

  return (
    <div className="w-1/6" key={props.tokenId}>
      <img src={`/${collection.key}/${props.tokenId}.png`} />
      <div className="text-center">{props.tokenId}</div>
      {isCollected && <button className="bg-pink-700 p-3 w-full">Create order</button>}
    </div>
  );
}
