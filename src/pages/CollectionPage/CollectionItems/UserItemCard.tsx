import { useContext } from 'react';
import { CollectionContext } from '../../App';
import { Order, WithSignature } from '../../../packages/order/marketplaceProtocol';
import { ItemCard } from './ItemCard';
import { useNavigate } from 'react-router-dom';
import { formatEther } from 'viem';

interface UserItemCardProps {
  tokenId: string;
  order?: WithSignature<Order>;
}

export function UserItemCard(props: UserItemCardProps) {
  const collection = useContext(CollectionContext);
  const navigate = useNavigate();

  const tokenPrice = props.order?.fulfillmentCriteria.token?.amount;
  const coinPrice =
    props.order?.fulfillmentCriteria.coin?.amount &&
    formatEther(BigInt(props.order.fulfillmentCriteria.coin.amount));

  return (
    <div className="w-1/6">
      <ItemCard tokenId={props.tokenId}></ItemCard>
      {props.order ? (
        <div>
          {coinPrice && <div>{coinPrice} ETH</div>}
          {tokenPrice && (
            <div>
              {tokenPrice} {collection.symbol}
            </div>
          )}
          <button className="bg-red-700 p-3 w-full">Cancel order</button>
        </div>
      ) : (
        <button
          className="bg-blue-700 p-3 w-full"
          onClick={() => navigate(`/c/${collection.key}/order/create/${props.tokenId}`)}
        >
          Create order
        </button>
      )}
    </div>
  );
}
