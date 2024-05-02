import {
  useAccount,
  useDisconnect,
  useEnsName,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import {
  ActionButton,
  Button,
  ButtonLight,
  CardNftSelectable,
  ListedNft,
  SpinnerIcon,
  Tab,
} from '.';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCollection, fetchUserOrders, fetchUserTokenIds } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { useIncrementCounter } from '../../hooks';
import { shortAddress } from '../../utils';
import { DialogContext } from '../App';
import { config } from '../../config';

export function AccountTab({ showTab, onNavigate }: { showTab: boolean; onNavigate: Function }) {
  const contract = useParams().contract!;
  const navigate = useNavigate();
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: userTokenIdsResponse } = useQuery({
    enabled: !!address,
    ...fetchUserTokenIds(contract, address!),
  });
  const { data: userOrdersResponse } = useQuery({
    enabled: !!address && !!userTokenIdsResponse?.data,
    ...fetchUserOrders(contract, address!, userTokenIdsResponse?.data?.tokenIds || []),
  });
  const [selectedTokenId, setSelectedTokenId] = useState<number | undefined>(undefined);
  const [lastSelectedTokenId, setLastSelectedTokenId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (selectedTokenId) setLastSelectedTokenId(selectedTokenId);
  }, [selectedTokenId]);

  const collection = collectionResponse?.data?.collection!;
  const tokenImages = collectionResponse?.data?.tokenImages!;
  const userTokenIds = userTokenIdsResponse?.data?.tokenIds;
  const userOrders = userOrdersResponse?.data?.orders;
  const userUnlistedTokens = userTokenIds?.filter(
    (tokenId) => !userOrders?.find((order) => order.tokenId === tokenId),
  );

  return (
    <Tab hidden={!showTab}>
      <div className="mt-24 flex-grow overflow-y-auto overflow-x-hidden">
        <div className="p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="overflow-x-hidden text-ellipsis font-medium">
              {!!ensName ? (
                <span>{ensName}</span>
              ) : (
                <span className="text-sm">{shortAddress(address)}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm text-zinc-400 cursor-pointer">
              <div className="hover:text-zinc-200" onClick={() => disconnect()}>
                Disconnect
              </div>
              {!!userOrders && (
                <ButtonIncrementCounter>
                  Cancel all orders ({userOrders.length})
                </ButtonIncrementCounter>
              )}
            </div>
          </div>
          <hr className="border-zinc-800 border-2 border-t-0 -mx-8" />
          <div className="flex flex-col gap-2">
            <div className="overflow-x-hidden text-ellipsis font-medium">{collection.name}</div>
            {!!userOrders && userOrders.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-zinc-400">Listed ({userOrders.length})</div>
                <div className="flex flex-col flex-wrap gap-4">
                  {userOrders.map(({ tokenId, fulfillmentCriteria }) => (
                    <ListedNft
                      tokenId={tokenId}
                      name={collection.name}
                      symbol={collection.symbol}
                      src={tokenImages[tokenId]}
                      key={tokenId}
                      tokenPrice={fulfillmentCriteria.token.amount}
                      ethPrice={fulfillmentCriteria.coin?.amount}
                      onClick={() => {
                        navigate('order/' + selectedTokenId);
                        onNavigate();
                        setSelectedTokenId(undefined);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!!userUnlistedTokens && userUnlistedTokens.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-zinc-400">Unlisted ({userUnlistedTokens.length})</div>
                <div className="grid grid-cols-3 gap-4">
                  {userUnlistedTokens.map((tokenId) => (
                    <CardNftSelectable
                      key={tokenId}
                      src={tokenImages[tokenId]}
                      selected={selectedTokenId === tokenId}
                      onSelect={() =>
                        setSelectedTokenId(selectedTokenId == tokenId ? undefined : tokenId)
                      }
                      tokenId={tokenId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>{selectedTokenId && <div className="h-16"></div>}</div>
      <div
        className={`fixed bottom-0 right-0 px-8 py-4 w-96 bg-zinc-800 flex gap-4 transition ease-in-out delay-0 ${
          selectedTokenId ? '' : 'translate-y-16'
        }`}
      >
        <Button disabled>{`${collection?.name} #${selectedTokenId || lastSelectedTokenId}`}</Button>
        <ActionButton
          onClick={() => {
            navigate('order/create/' + selectedTokenId);
            onNavigate();
            setSelectedTokenId(undefined);
          }}
        >
          List Item
        </ActionButton>
      </div>
    </Tab>
  );
}

function ButtonIncrementCounter({ children }: { children: ReactNode }) {
  const { setDialog } = useContext(DialogContext);
  const { chainId } = useAccount();
  const {
    switchChain,
    data: switchChainData,
    isPending: switchNetworkIsPending,
    isError: switchNetworkIsError,
  } = useSwitchChain();
  const queryClient = useQueryClient();
  const {
    incrementCounter,
    data: incrementCounterData,
    isPending: incrementCounterIsPending,
    isError: incrementCounterIsError,
  } = useIncrementCounter();
  const { data: incrementCounterReceiptData } = useWaitForTransactionReceipt({
    hash: incrementCounterData,
  });

  useEffect(() => {
    if (incrementCounterIsError || switchNetworkIsError) {
      setDialog(undefined);
    }
  }, [incrementCounterIsError, switchNetworkIsError]);

  useEffect(() => {
    if (incrementCounterIsPending || switchNetworkIsPending) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Cancel all orders</div>
            <SpinnerIcon />
            <div>Confirm in your wallet</div>
            <div className="text-sx text-zinc-400 flex gap-2">
              <div>⚠️</div>
              <div>
                Warning: This will also cancel all your Opensea orders and offers, for all
                collections.
              </div>
            </div>
          </div>
        </div>,
      );
    }
  }, [incrementCounterIsPending, switchNetworkIsPending]);

  useEffect(() => {
    if (incrementCounterData) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Cancel all orders</div>
            <SpinnerIcon />
            <div>Transaction is pending...</div>
          </div>
        </div>,
      );
    }
  }, [incrementCounterData]);

  useEffect(() => {
    if (!incrementCounterReceiptData) return;
    if (incrementCounterReceiptData?.transactionHash == incrementCounterData) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Cancel all orders</div>
            <div>All orders have been canceled.</div>
            <ButtonLight onClick={() => setDialog(undefined)}>OK</ButtonLight>
          </div>
        </div>,
      );
      queryClient.invalidateQueries({ queryKey: [fetchUserOrders('', '', []).queryKey[0]] });
    } else {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Cancel all orders</div>
            <div>Aborted: transaction was cancelled or replaced.</div>
            <ButtonLight onClick={() => setDialog(undefined)}>OK</ButtonLight>
          </div>
        </div>,
      );
    }
  }, [incrementCounterReceiptData]);

  useEffect(() => {
    if (switchChainData?.id == config.eth.chain.id) {
      incrementCounter();
    }
  }, [switchChainData]);

  return (
    <div
      className="hover:text-zinc-200"
      onClick={() => {
        if (chainId == config.eth.chain.id) {
          incrementCounter();
          return;
        }

        switchChain({ chainId: config.eth.chain.id });
      }}
    >
      {children}
    </div>
  );
}
