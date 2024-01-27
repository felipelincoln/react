import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContext } from 'react';
import { CollectionContext } from '../App';
import { useAccount } from 'wagmi';

interface CollectionItemsProps {
  userTokenIds: string[];
}

export function CollectionItems(props: CollectionItemsProps) {
  const { isConnected } = useAccount();
  const collection = useContext(CollectionContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showUserItemsTab = searchParams.get('myItems') === '1' && isConnected;

  const userTokenIds = showUserItemsTab ? props.userTokenIds : [];
  const itemElements = userTokenIds.map((tokenId) => {
    return (
      <div className="w-1/2 shrink-0" key={tokenId}>
        <img src={`/${collection.key}/${tokenId}.png`} />
        <div className="text-center">{tokenId}</div>
        <button
          onClick={() => navigate(`/c/${collection.key}/order/create/${tokenId}`)}
          className="bg-pink-700 p-3 w-full"
        >
          Create Order
        </button>
      </div>
    );
  });

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div>{userTokenIds.length} Results</div>
        </div>
        <div>Attributes (0)</div>
      </div>
      <div className="flex flex-wrap justify-between">{itemElements}</div>
    </div>
  );
}
