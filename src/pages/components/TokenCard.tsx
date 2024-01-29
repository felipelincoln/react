import { useContext } from 'react';
import { CollectionContext, UserTokenIdsContext } from '../App';
import { useNavigate } from 'react-router-dom';

interface TokenCardProps {
  tokenId: string;
}

export function TokenCard(props: TokenCardProps) {
  const collection = useContext(CollectionContext);
  const userTokenIds = useContext(UserTokenIdsContext);
  const navigate = useNavigate();

  const isCollected = userTokenIds.includes(props.tokenId);

  return (
    <div className="w-full" key={props.tokenId}>
      <img src={`/${collection.key}/${props.tokenId}.png`} />
      <div className="text-center">{props.tokenId}</div>
      {isCollected && (
        <button
          className="bg-pink-700 p-3 w-full"
          onClick={() => navigate(`/c/${collection.key}/order/create/${props.tokenId}`)}
        >
          Create order
        </button>
      )}
    </div>
  );
}
