import moment from 'moment';
import { etherToString } from '../utils';
import {
  ButtonBlue,
  ButtonLight,
  ButtonRed,
  CardNftSelectable,
  InputDisabledWithLabel,
  Paginator,
  SpinnerIcon,
  TextBox,
  TextBoxWithNfts,
  Tootltip,
} from './components';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchOrders, fetchUserTokenIds } from '../api/query';
import { useNavigate, useParams } from 'react-router-dom';
import { NotFoundPage } from './fallback';
import { ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useCancelOrder, useFulfillOrder } from '../hooks';
import { DialogContext } from './App';
import { config } from '../config';

export function OrderFulfillPage() {
  const contract = useParams().contract!;
  const tokenId = Number(useParams().tokenId!);
  const { setDialog } = useContext(DialogContext);
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: userBalance } = useBalance({ address });
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: orderResponse } = useSuspenseQuery(fetchOrders(contract, [tokenId]));
  const { data: userTokenIdsResponse } = useQuery({
    enabled: !!address,
    ...fetchUserTokenIds(contract, address!),
  });

  const [paginatedTokenIds, setPaginatedTokenIds] = useState<number[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [page, setPage] = useState<number>(0);
  const [error, setError] = useState<string | undefined>();
  const {
    fulfillOrder,
    isValidChainStatus,
    isApprovedForAllStatus,
    fulfillAdvancedOrderStatus,
    orderQueryStatus,
    isSuccess,
    isError,
  } = useFulfillOrder();

  const {
    cancelOrder,
    isValidChainStatus: cancelOrderisValidChainStatus,
    seaportCancelOrderStatus,
    userOrdersQueryStatus,
    isSuccess: cancelOrderIsSuccess,
    isError: cancelOrderIsError,
  } = useCancelOrder();

  const isReady = collectionResponse!.data!.isReady;
  const collection = collectionResponse!.data!.collection;
  const tokenImages = collectionResponse!.data!.tokenImages || {};
  const userTokenIds = userTokenIdsResponse?.data?.tokenIds || [];
  const order = orderResponse.data?.orders[0];
  const isOrderOwner = order?.offerer == (address || '').toLowerCase();
  const tokenPrice = Number(order?.fulfillmentCriteria.token.amount);
  const ethCost =
    BigInt(order?.fulfillmentCriteria.coin?.amount || '0') + BigInt(order?.fee?.amount || '0');

  const orderTokenIdsSorted = useMemo(() => {
    if (!order) return [];

    const orderTokenIdsCopy = [...order.fulfillmentCriteria.token.identifier];
    orderTokenIdsCopy.sort((a, b) => {
      const aIsUserToken = userTokenIds.includes(Number(a));
      const bIsUserToken = userTokenIds.includes(Number(b));
      if (aIsUserToken && !bIsUserToken) {
        return -1;
      } else if (!aIsUserToken && bIsUserToken) {
        return 1;
      } else {
        return a - b;
      }
    });
    console.log('> [app] sorting tokens');

    return orderTokenIdsCopy;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, userTokenIds.join('-')]);

  useEffect(() => {
    if (isError) {
      setDialog(undefined);
    }

    if (isValidChainStatus == 'pending') {
      setDialog(
        OrderFulfillDialog(
          <div>
            <div className="text-center">{`Switching to ${config.eth.chain.name} network`}</div>
            <div className="text-center">Confirm in your wallet</div>
          </div>,
        ),
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:read') {
      setDialog(OrderFulfillDialog('Verifying Seaport allowance ...'));
      return;
    }

    if (isApprovedForAllStatus == 'pending:write') {
      setDialog(
        OrderFulfillDialog(
          <div>
            <div className="text-center">{`Allowing Seaport to access your ${collection.symbol}`}</div>
            <div className="text-center">Confirm in your wallet</div>
          </div>,
        ),
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:receipt') {
      setDialog(OrderFulfillDialog('Waiting for approval transaction to confirm ...'));
      return;
    }

    if (fulfillAdvancedOrderStatus == 'pending:write') {
      setDialog(OrderFulfillDialog(<div className="text-center">Confirm in your wallet</div>));
      return;
    }

    if (fulfillAdvancedOrderStatus == 'pending:receipt') {
      setDialog(OrderFulfillDialog('Waiting for purchase transaction to confirm ...'));
      return;
    }

    if (orderQueryStatus == 'pending') {
      setDialog(OrderFulfillDialog());
      return;
    }

    if (isSuccess) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 max-w-lg">
            <div className="w-full font-medium pb-4">Order fulfill</div>
            <div className="flex flex-col items-center gap-4">
              <div>Success!</div>
              <ButtonLight
                onClick={() => {
                  navigate(`/c/${contract}`);
                  setDialog(undefined);
                }}
              >
                Ok
              </ButtonLight>
            </div>
          </div>
        </div>,
      );
    }
  }, [
    isApprovedForAllStatus,
    isValidChainStatus,
    fulfillAdvancedOrderStatus,
    orderQueryStatus,
    isError,
    isSuccess,
    collection,
    contract,
    navigate,
    setDialog,
  ]);

  useEffect(() => {
    if (cancelOrderIsError) {
      setDialog(undefined);
    }

    if (cancelOrderisValidChainStatus == 'pending') {
      setDialog(
        OrderCancelDialog(
          <div>
            <div className="text-center">{`Switching to ${config.eth.chain.name} network`}</div>
            <div className="text-center">Confirm in your wallet</div>
          </div>,
        ),
      );
      return;
    }

    if (seaportCancelOrderStatus == 'pending:read') {
      setDialog(OrderCancelDialog('Reading Seaport counter ...'));
      return;
    }

    if (seaportCancelOrderStatus == 'pending:write') {
      setDialog(
        OrderCancelDialog(
          <div>
            <div className="text-center">Confirm in your wallet</div>
          </div>,
        ),
      );
      return;
    }

    if (seaportCancelOrderStatus == 'pending:receipt') {
      setDialog(OrderCancelDialog('Waiting for cancel transaction to confirm ...'));
      return;
    }

    if (userOrdersQueryStatus == 'pending') {
      setDialog(OrderCancelDialog());
      return;
    }

    if (cancelOrderIsSuccess) {
      navigate(`/c/${contract}`);
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 max-w-lg">
            <div className="w-full font-medium pb-4">Cancel order</div>
            <div className="flex flex-col items-center gap-4">
              <div>Success!</div>
              <ButtonLight
                onClick={() => {
                  navigate(`/c/${contract}`);
                  setDialog(undefined);
                }}
              >
                Ok
              </ButtonLight>
            </div>
          </div>
        </div>,
      );
    }
  }, [
    cancelOrderisValidChainStatus,
    seaportCancelOrderStatus,
    userOrdersQueryStatus,
    cancelOrderIsSuccess,
    cancelOrderIsError,
    contract,
    navigate,
    setDialog,
  ]);

  function submit() {
    if (!order) return;
    if (!userBalance) return;

    if (moment().unix() > order?.endTime) {
      setError('Order has expired');
      return;
    }

    if (selectedTokenIds.length < tokenPrice) {
      setError(`Must select ${tokenPrice} ${collection.symbol}`);
      return;
    }

    if (userBalance?.value < ethCost) {
      setError('Insufficient funds');
      return;
    }

    fulfillOrder({ ...order, selectedTokenIds });
    setError(undefined);
  }

  if (Number.isNaN(tokenId) || !order || !isReady) {
    return <NotFoundPage />;
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <div className="flex justify-between">
        <h1 className="pb-8">Order</h1>
        {isOrderOwner && <ButtonRed onClick={() => cancelOrder(order)}>Cancel listing</ButtonRed>}
      </div>
      <div className="flex gap-12">
        <div className="flex-grow flex flex-col gap-8">
          <div>
            <span className="flex items-center gap-4 pb-4">
              <span className="text-sm font-medium">Selected items</span>{' '}
              <Tootltip>Selected items will be used to fulfill this order</Tootltip>
            </span>
            <InputDisabledWithLabel value={selectedTokenIds.length} label={`${tokenPrice}`} />
          </div>
          <div className="flex flex-wrap gap-4">
            {order &&
              paginatedTokenIds.map((tokenId) => (
                <CardNftSelectable
                  key={tokenId}
                  tokenId={Number(tokenId)}
                  src={tokenImages[tokenId]}
                  onSelect={() => {
                    let tokenIds = [...selectedTokenIds];
                    if (tokenIds.includes(tokenId)) {
                      tokenIds = tokenIds.filter((id) => id != tokenId);
                    } else {
                      if (tokenPrice == 1) {
                        setSelectedTokenIds([tokenId]);
                      }
                      if (selectedTokenIds.length >= tokenPrice) {
                        return;
                      }
                      tokenIds.push(tokenId);
                    }
                    setSelectedTokenIds(tokenIds);
                  }}
                  selected={selectedTokenIds.includes(tokenId)}
                  disabled={!userTokenIds.includes(Number(tokenId))}
                />
              ))}
          </div>
          <Paginator
            items={orderTokenIdsSorted}
            page={page}
            setItems={setPaginatedTokenIds}
            setPage={setPage}
            itemsPerPage={30}
          />
        </div>
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            {tokenImages[tokenId] ? (
              <img className="rounded w-40 h-40 mx-auto" src={tokenImages[tokenId]} />
            ) : (
              <div className="w-40 h-40 rounded bg-zinc-700 mx-auto"></div>
            )}

            <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You pay</div>
            <div>
              {ethCost > 0 && <TextBox>{`${etherToString(ethCost, false)}`}</TextBox>}
              {order?.fee && (
                <div className="text-zinc-400 text-xs pt-1 pl-4">
                  fee: {etherToString(BigInt(order?.fee?.amount), false)}
                </div>
              )}
            </div>
            {+order?.fulfillmentCriteria.token.amount > 0 && (
              <TextBoxWithNfts
                value={`${order?.fulfillmentCriteria.token.amount} ${collection.symbol}`}
                tokens={selectedTokenIds.map((t) => [Number(t), tokenImages[t]])}
              />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>Order expires</div>
            <TextBox>{moment(order.endTime * 1000).fromNow()}</TextBox>
          </div>
          <div className="flex items-center">
            <ButtonBlue loading={!order || !userBalance} onClick={submit}>
              Confirm
            </ButtonBlue>
            <a className="default mx-8" onClick={() => navigate(`/c/${contract}`)}>
              Cancel
            </a>
          </div>
          {error && <div className="overflow-hidden text-ellipsis red">{error}</div>}
        </div>
      </div>
    </div>
  );
}

function OrderFulfillDialog(message?: ReactNode) {
  return (
    <div>
      <div className="flex flex-col items-center gap-4 max-w-lg">
        <div className="w-full font-medium pb-4">Fulfill order</div>
        <SpinnerIcon />
        <div>{message}</div>
      </div>
    </div>
  );
}

function OrderCancelDialog(message?: ReactNode) {
  return (
    <div>
      <div className="flex flex-col items-center gap-4 max-w-lg">
        <div className="w-full font-medium pb-4">Cancel order</div>
        <SpinnerIcon />
        <div>{message}</div>
      </div>
    </div>
  );
}
