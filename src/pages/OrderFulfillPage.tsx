import moment from 'moment';
import { etherToString } from '../utils';
import {
  BulletPointContent,
  BulletPointItem,
  BulletPointList,
  ButtonBlue,
  ButtonLight,
  ButtonRed,
  CardNftSelectable,
  ListedNft,
  OpenSeaButton,
  Paginator,
  PriceTag,
  TextBox,
  TextBoxWithNfts,
} from './components';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchOrders, fetchUserTokenIds } from '../api/query';
import { useNavigate, useParams } from 'react-router-dom';
import { NotFoundPage } from './fallback';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useCancelOrder, useFulfillOrder } from '../hooks';
import { DialogContext } from './App';
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

  const ListingDetails = useCallback(() => {
    return (
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
    );

    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  // order fulfill dialog
  useEffect(() => {
    if (isError) {
      setDialog(undefined);
    }

    if (isValidChainStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem ping>Check network</BulletPointItem>
          <BulletPointContent>
            <div className="text-red-400">Wrong network</div>
            <div>Continue in your wallet</div>
          </BulletPointContent>
          <BulletPointItem disabled>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing fulfilled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:read') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Check allowance</BulletPointItem>
          <BulletPointContent>Verifying allowance...</BulletPointContent>
          <BulletPointItem disabled>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing fulfilled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:write') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Check allowance</BulletPointItem>
          <BulletPointContent>
            <div className="text-red-400">No allowance</div>
            <div>Continue in your wallet</div>
          </BulletPointContent>
          <BulletPointItem disabled>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing fulfilled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:receipt') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Check allowance</BulletPointItem>
          <BulletPointContent>Transaction is pending...</BulletPointContent>
          <BulletPointItem disabled>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing fulfilled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (fulfillAdvancedOrderStatus == 'pending:write') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Send transaction</BulletPointItem>
          <BulletPointContent>Continue in your wallet</BulletPointContent>
          <BulletPointItem disabled>Listing fulfilled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (fulfillAdvancedOrderStatus == 'pending:receipt') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Send transaction</BulletPointItem>
          <BulletPointContent>Transaction is pending...</BulletPointContent>
          <BulletPointItem disabled>Listing fulfilled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (orderQueryStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Listing fulfilled</BulletPointItem>
          <BulletPointContent>Processing purchase...</BulletPointContent>
        </BulletPointList>,
      );
      return;
    }

    if (isSuccess) {
      navigate(`/c/${contract}`);

      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Fulfill listing</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Listing fulfilled</BulletPointItem>
          <BulletPointContent>
            <div>
              <ButtonLight onClick={() => setDialog(undefined)}>Ok</ButtonLight>
            </div>
          </BulletPointContent>
        </BulletPointList>,
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
    ListingDetails,
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
          <ListingDetails />
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
          <ListingDetails />
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
          <ListingDetails />
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
          <ListingDetails />
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
          <ListingDetails />
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
          <ListingDetails />
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
    ListingDetails,
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
      <div>
        <h1 className="pb-8">Listing</h1>
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
          <div className="w-80 pb-6 flex gap-2">
            <div
              className="group flex gap-2 items-center w-full cursor-pointer"
              onClick={() => navigate(`/c/${contract}`)}
            >
              <img src={collection.image} className="w-8 h-8 rounded" />
              <div className="text-lg font-medium overflow-hidden text-nowrap text-ellipsis group-hover:underline">
                {collection.name}
              </div>
            </div>
            <OpenSeaButton contract={collection.contract} tokenId={tokenId} />
          </div>
          <div className="sticky top-32">
            <div className="w-80 h-fit bg-zinc-800 p-8 rounded flex flex-col gap-8">
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
                {isOrderOwner ? (
                  <ButtonRed onClick={() => cancelOrder(order)}>Cancel listing</ButtonRed>
                ) : (
                  <ButtonBlue loading={!order || !userBalance} disabled={!address} onClick={submit}>
                    Confirm
                  </ButtonBlue>
                )}

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
    </div>
  );
}
