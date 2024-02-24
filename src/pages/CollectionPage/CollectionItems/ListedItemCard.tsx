import { useContext } from 'react';
import { CollectionContext } from '../../App';
import { Order, WithSignature } from '../../../packages/order/marketplaceProtocol';
import { ItemCard } from './ItemCard';
import { formatEther } from 'viem';
import { useNavigate } from 'react-router-dom';

interface ListedItemCardProps {
  tokenId: string;
  order: WithSignature<Order>;
}

export function ListedItemCard(props: ListedItemCardProps) {
  const collection = useContext(CollectionContext);
  const navigate = useNavigate();

  const tokenPrice = props.order.fulfillmentCriteria.token?.amount;
  const coinPrice =
    props.order.fulfillmentCriteria.coin?.amount &&
    formatEther(BigInt(props.order.fulfillmentCriteria.coin.amount));

  return (
    <div className="w-1/6">
      <ItemCard tokenId={props.tokenId}></ItemCard>
      <div>
        {coinPrice && <div>{coinPrice} ETH</div>}
        {tokenPrice && (
          <div>
            {tokenPrice} {collection.symbol}
          </div>
        )}
        <button
          className="bg-green-700 p-3 w-full"
          onClick={() => navigate(`/c/${collection.key}/order/fulfill/${props.tokenId}`)}
        >
          Buy
        </button>
      </div>
    </div>
  );
}
