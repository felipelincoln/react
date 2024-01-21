import { useContext } from 'react';
import { CollectionContext } from '../App';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function CollectionItems() {
  const collection = useContext(CollectionContext);
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [searchParams] = useSearchParams();

  const myItems = searchParams.get('myItems') === '1';

  const { data: result }: { data: { data: { tokens: string[] } } } = useQuery({
    initialData: { data: { tokens: [] } },
    queryKey: ['user_token_ids'],
    queryFn: () => fetch(`http://localhost:3000/tokens/${address}`).then((res) => res.json()),
    enabled: isConnected && myItems,
  });

  let userTokenIds: string[] = [];

  if (isConnected && myItems) {
    userTokenIds = result.data.tokens;
  } else {
    userTokenIds = [];
  }

  const itemElements = userTokenIds.map((tokenId) => {
    return (
      <div className="w-1/2 shrink-0" key={tokenId}>
        <img src={`/${collection.key}/${tokenId}.png`} />
        <div className="text-center">{tokenId}</div>
        <button
          onClick={() => navigate(`/order/create/${tokenId}`)}
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
