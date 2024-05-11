import moment from 'moment';
import { etherToString } from '../utils';
import {
  ActionButton,
  CardNftSelectable,
  InputDisabledWithLabel,
  Paginator,
  TextBox,
  TextBoxWithNfts,
  Tootltip,
} from './components';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchOrders } from '../api/query';
import { useParams } from 'react-router-dom';
import { NotFoundPage } from './fallback';

export function OrderFulfillPage() {
  const contract = useParams().contract!;
  const tokenId = Number(useParams().tokenId!);
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: orderResponse } = useSuspenseQuery(fetchOrders(contract, [tokenId]));

  if (Number.isNaN(tokenId)) {
    return <NotFoundPage />;
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <h1 className="pb-8">Order</h1>
      <div className="flex gap-12">
        <div className="flex-grow flex flex-col gap-8">
          <div>
            <span className="flex items-center gap-4 pb-4">
              <span className="text-sm font-medium">Selected items</span>{' '}
              <Tootltip>Selected items will be used to fulfill this order</Tootltip>
            </span>
            <InputDisabledWithLabel value={selectedTokenIds.length} label={`${orderTokenAmount}`} />
          </div>
          <div className="flex flex-wrap gap-4">
            {order &&
              paginatedTokenIds.map((tokenId) => (
                <CardNftSelectable
                  key={tokenId}
                  tokenId={Number(tokenId)}
                  src={tokenImages[tokenId]}
                  onSelect={() => handleSelectToken(tokenId)}
                  selected={selectedTokenIds.includes(tokenId)}
                  disabled={!userTokenIds?.includes(Number(tokenId))}
                />
              ))}
          </div>
          <Paginator
            items={orderTokenIdsSorted}
            page={tokensPage}
            setItems={setPaginatedTokenIds}
            setPage={setTokensPage}
            itemsPerPage={18}
          />
        </div>
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={tokenImages[tokenId]} />
            <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You pay</div>
            <div>
              {totalAmount > 0 && <TextBox>{`${etherToString(totalAmount, false)}`}</TextBox>}
              {order?.fee && (
                <div className="text-zinc-400 text-xs pt-1 pl-4">
                  fee: {etherToString(BigInt(order?.fee?.amount), false)}
                </div>
              )}
            </div>
            <TextBoxWithNfts
              value={`${order?.fulfillmentCriteria.token.amount} ${collection?.symbol}`}
              tokens={selectedTokenIds.map((t) => [Number(t), tokenImages[t]])}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>Order expires</div>
            <TextBox>
              {moment(now * 1000)
                .add(form.expireDays, 'days')
                .fromNow()}
            </TextBox>
          </div>
          <div className="flex items-center">
            <ActionButton onClick={submit}>Confirm</ActionButton>
            <a className="default mx-8" onClick={() => navigate(`/c/${contract}`)}>
              Cancel
            </a>
          </div>
          {!!form.error && <div className="overflow-hidden text-ellipsis red">{form.error}</div>}
        </div>
      </div>
    </div>
  );
}
