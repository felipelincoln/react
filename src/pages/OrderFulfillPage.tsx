import moment from 'moment';
import { etherToString } from '../utils';
import {
  BulletPointContent,
  BulletPointItem,
  BulletPointList,
  Button,
  ButtonBlue,
  ButtonLight,
  ButtonRed,
  CardNftSelectable,
  ListedNft,
  OpenSeaButton,
  Paginator,
  PriceTag,
  SpinnerIcon,
  TextBox,
  TextBoxWithNfts,
} from './components';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchOrders, fetchUserTokenIds } from '../api/query';
import { useNavigate, useParams } from 'react-router-dom';
import { NotFoundPage } from './fallback';
import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useCancelOrder, useFulfillOrder } from '../hooks';
import { DialogContext } from './App';
import { config } from '../config';
import { verifiedCollections } from '../verifiedCollections';
import { Order } from '../api/types';

export function OrderFulfillPage() {
  const contract = useParams().contract!;
  const tokenId = Number(useParams().tokenId!);
  const { setDialog } = useContext(DialogContext);
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: userBalance } = useBalance({ address });
  const orderRef = useRef<Order | undefined>(undefined);
  const cancelOrderTxHashRef = useRef<string | undefined>(undefined);
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
    cancelOrderTxHash,
    cancelOrder,
    isValidChainStatus: cancelOrderisValidChainStatus,
    seaportCancelOrderStatus,
    userOrdersQueryStatus,
    isSuccess: cancelOrderIsSuccess,
    isError: cancelOrderIsError,
  } = useCancelOrder();

  const isReady = collectionResponse!.data!.isReady;
  const collection = collectionResponse!.data!.collection;
  const verifiedCollection = verifiedCollections[collection.contract];
  const tokenImages = collectionResponse!.data!.tokenImages || {};
  const userTokenIds = userTokenIdsResponse?.data?.tokenIds || [];
  const tokenImage = tokenImages[tokenId];
  const order = orderResponse.data?.orders[0];
  const isOrderOwner = order?.offerer == (address || '').toLowerCase();
  const tokenPrice = Number(order?.fulfillmentCriteria.token.amount);
  const ethCost =
    BigInt(verifiedCollection?.royalty?.amount || '0') +
    BigInt(order?.fulfillmentCriteria.coin?.amount || '0') +
    BigInt(order?.fee?.amount || '0');

  useEffect(() => {
    if (!order) return;

    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    if (!cancelOrderTxHash) return;

    cancelOrderTxHashRef.current = cancelOrderTxHash;
  }, [cancelOrderTxHash]);

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

  // order fulfill dialog
  useEffect(() => {
    if (isError) {
      setDialog(undefined);
    }

    if (isValidChainStatus == 'pending') {
      setDialog(
        OrderFulfillDialog(
          <div>
            <div className="text-center">{`Switching to ${config.web3.chain.name} network`}</div>
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
            <div className="w-full font-medium pb-4">Listing fulfill</div>
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

  // order cancel dialog
  useEffect(() => {
    if (cancelOrderIsError) {
      setDialog(undefined);
    }

    if (cancelOrderisValidChainStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel listing</div>
          <div className="pb-8">
            <ListedNft
              tokenId={tokenId}
              name={collection.name}
              symbol={collection.symbol}
              src={tokenImage}
              key={tokenId}
              tokenPrice={order?.fulfillmentCriteria.token.amount || '0'}
              ethPrice={order?.fulfillmentCriteria.coin?.amount}
            />
          </div>

          <BulletPointItem ping>Check network</BulletPointItem>
          <BulletPointContent>
            <div className="text-red-400">Wrong network</div>
            <div>Continue in your wallet</div>
          </BulletPointContent>
          <BulletPointItem disabled>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing canceled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (seaportCancelOrderStatus == 'pending:read') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel listing</div>
          <div className="pb-8">
            <ListedNft
              tokenId={tokenId}
              name={collection.name}
              symbol={collection.symbol}
              src={tokenImage}
              key={tokenId}
              tokenPrice={order?.fulfillmentCriteria.token.amount || '0'}
              ethPrice={order?.fulfillmentCriteria.coin?.amount}
            />
          </div>

          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Send transaction</BulletPointItem>
          <BulletPointContent>Creating transaction...</BulletPointContent>
          <BulletPointItem disabled>Listing canceled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (seaportCancelOrderStatus == 'pending:write') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel listing</div>
          <div className="pb-8">
            <ListedNft
              tokenId={tokenId}
              name={collection.name}
              symbol={collection.symbol}
              src={tokenImage}
              key={tokenId}
              tokenPrice={order?.fulfillmentCriteria.token.amount || '0'}
              ethPrice={order?.fulfillmentCriteria.coin?.amount}
            />
          </div>

          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Send transaction</BulletPointItem>
          <BulletPointContent>Continue in your wallet</BulletPointContent>
          <BulletPointItem disabled>Listing canceled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (seaportCancelOrderStatus == 'pending:receipt') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel listing</div>
          <div className="pb-8">
            <ListedNft
              tokenId={tokenId}
              name={collection.name}
              symbol={collection.symbol}
              src={tokenImage}
              key={tokenId}
              tokenPrice={order?.fulfillmentCriteria.token.amount || '0'}
              ethPrice={order?.fulfillmentCriteria.coin?.amount}
            />
          </div>

          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Send transaction</BulletPointItem>
          <BulletPointContent>Transaction is pending...</BulletPointContent>
          <BulletPointItem disabled>Listing canceled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (userOrdersQueryStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel listing</div>
          <div className="pb-8">
            <ListedNft
              tokenId={tokenId}
              name={collection.name}
              symbol={collection.symbol}
              src={tokenImage}
              key={tokenId}
              tokenPrice={order?.fulfillmentCriteria.token.amount || '0'}
              ethPrice={order?.fulfillmentCriteria.coin?.amount}
            />
          </div>

          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Listing canceled</BulletPointItem>
          <BulletPointContent>Deleting the listing...</BulletPointContent>
        </BulletPointList>,
      );
      return;
    }

    if (cancelOrderIsSuccess) {
      navigate(`/c/${contract}`);
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel listing</div>
          <div className="pb-8">
            <ListedNft
              tokenId={tokenId}
              name={collection.name}
              symbol={collection.symbol}
              src={tokenImage}
              key={tokenId}
              tokenPrice={orderRef.current?.fulfillmentCriteria.token.amount || '0'}
              ethPrice={orderRef.current?.fulfillmentCriteria.coin?.amount}
            />
          </div>

          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Listing canceled</BulletPointItem>
          <BulletPointContent>
            <div>
              <ButtonLight onClick={() => setDialog(undefined)}>Ok</ButtonLight>
            </div>
          </BulletPointContent>
        </BulletPointList>,
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
    cancelOrderTxHash,
    collection,
    order,
    tokenId,
    tokenImage,
  ]);

  function submit() {
    if (!order) return;
    if (!userBalance) return;

    if (moment().unix() > order?.endTime) {
      setError('Listing has expired');
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

  function priceDetailsDialog() {
    return (
      <div>
        <div className="flex justify-between">
          <div className="text-lg font-bold">ETH payment details</div>
          <div className="cursor-pointer" onClick={() => setDialog(undefined)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
            >
              <path
                d="M19.0005 4.99988L5.00045 18.9999M5.00045 4.99988L19.0005 18.9999"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="pt-4 flex flex-col gap-2">
          {order?.fulfillmentCriteria.coin && (
            <div className="flex gap-2">
              Price:
              <PriceTag>
                {etherToString(BigInt(order.fulfillmentCriteria.coin.amount), false)}
              </PriceTag>
            </div>
          )}

          {order?.fee && (
            <div className="flex gap-2">
              Marketplace fee:
              <PriceTag>{etherToString(BigInt(order.fee.amount), false)}</PriceTag>
            </div>
          )}
          {verifiedCollection?.royalty && (
            <div className="flex gap-2">
              Creator fee:
              <PriceTag>{etherToString(BigInt(verifiedCollection.royalty.amount), false)}</PriceTag>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (Number.isNaN(tokenId) || !order || !isReady) {
    return <NotFoundPage />;
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <div className="flex justify-between">
        <h1 className="pb-8">Listing</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate(`/c/${contract}`)}>Back</Button>
          {isOrderOwner && <ButtonRed onClick={() => cancelOrder(order)}>Cancel listing</ButtonRed>}
          <div>
            <OpenSeaButton contract={collection.contract} tokenId={tokenId} />
          </div>
        </div>
      </div>
      <div className="flex gap-12">
        <div className="flex-grow flex flex-col gap-8">
          {order.fulfillmentCriteria.token.amount != '0' ? (
            <div className="flex gap-2 text-lg">
              Select{' '}
              <PriceTag>
                {order.fulfillmentCriteria.token.amount} {collection.symbol}
              </PriceTag>{' '}
              to fulfill this listing:
            </div>
          ) : (
            <div className="flex gap-2 text-lg">
              No <PriceTag>{collection.symbol}</PriceTag> required to fulfill this listing.
            </div>
          )}
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
        <div>
          <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
            <div>
              {tokenImage ? (
                <img className="rounded w-40 h-40 mx-auto" src={tokenImage} />
              ) : (
                <div className="w-40 h-40 rounded bg-zinc-700 mx-auto"></div>
              )}

              <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="font-bold">You pay</div>
              {+order?.fulfillmentCriteria.token.amount > 0 && (
                <TextBoxWithNfts
                  value={`${order?.fulfillmentCriteria.token.amount} ${collection.symbol}`}
                  tokens={selectedTokenIds.map((t) => [Number(t), tokenImages[t]])}
                />
              )}
              <div>
                {ethCost > 0 && (
                  <TextBox>
                    <div className="flex justify-between items-center">
                      <div>{`${etherToString(ethCost, false)}`}</div>
                      <div
                        className="text-zinc-400 cursor-pointer"
                        onClick={() => setDialog(priceDetailsDialog())}
                      >
                        details
                      </div>
                    </div>
                  </TextBox>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 items-center">
              <ButtonBlue loading={!order || !userBalance} disabled={!address} onClick={submit}>
                Confirm
              </ButtonBlue>
              <div className="text-zinc-400 text-sm">
                Expires {moment(order.endTime * 1000).fromNow()}
              </div>
            </div>
          </div>
          {error && (
            <div className="overflow-hidden text-ellipsis red pt-8 text-center">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderFulfillDialog(message?: ReactNode) {
  return (
    <div>
      <div className="flex flex-col items-center gap-4 max-w-lg">
        <div className="w-full font-medium pb-4">Fulfill listing</div>
        <SpinnerIcon />
        <div>{message}</div>
      </div>
    </div>
  );
}
