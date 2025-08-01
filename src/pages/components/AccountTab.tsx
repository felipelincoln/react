import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import {
  BulletPointContent,
  BulletPointItem,
  BulletPointList,
  Button,
  ButtonBlue,
  ButtonLight,
  CardNftSelectable,
  ListedNft,
  Tab,
} from '.';
import { useQuery } from '@tanstack/react-query';
import { fetchCollection, fetchUserOrders, fetchUserTokenIds } from '../../api/query';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { shortAddress } from '../../utils';
import { DialogContext } from '../App';
import { useCancelAllOrders } from '../../hooks';

export function AccountTab({ showTab, onNavigate }: { showTab: boolean; onNavigate: () => void }) {
  const contract = useParams().contract!;
  const navigate = useNavigate();
  const { setDialog } = useContext(DialogContext);
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
    ...fetchUserOrders(contract, address!),
  });
  const [selectedTokenId, setSelectedTokenId] = useState<number | undefined>(undefined);
  const [lastSelectedTokenId, setLastSelectedTokenId] = useState<number | undefined>(undefined);
  const {
    cancelAllOrders,
    isError,
    isSuccess,
    isValidChainStatus,
    seaportIncrementCounterStatus,
    userOrdersQueryStatus,
  } = useCancelAllOrders();

  useEffect(() => {
    if (selectedTokenId) setLastSelectedTokenId(selectedTokenId);
  }, [selectedTokenId]);

  useEffect(() => {
    if (isError) {
      setDialog(undefined);
    }

    if (isValidChainStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel all listings</div>
          <BulletPointItem ping>Check network</BulletPointItem>
          <BulletPointContent>
            <div className="text-red-400">Wrong network</div>
            <div>Continue in your wallet</div>
          </BulletPointContent>
          <BulletPointItem disabled>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listings canceled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (seaportIncrementCounterStatus == 'pending:write') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel all listings</div>
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Send transaction</BulletPointItem>
          <BulletPointContent>
            <div className="flex flex-col text-zinc-400 text-sm">
              <div>Continue in your wallet</div>
              <div className="text-red-400">
                Warning: All your listings from all collections will be canceled, including those
                created on OpenSea
              </div>
            </div>
          </BulletPointContent>
          <BulletPointItem disabled>Listings canceled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (seaportIncrementCounterStatus == 'pending:receipt') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel all listings</div>
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Send transaction</BulletPointItem>
          <BulletPointContent>Transaction is pending...</BulletPointContent>
          <BulletPointItem disabled>Listings canceled</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (userOrdersQueryStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel all listings</div>
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Listings canceled</BulletPointItem>
          <BulletPointContent>Deleting all listings...</BulletPointContent>
        </BulletPointList>,
      );
      return;
    }

    if (isSuccess) {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">Cancel all listings</div>
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Send transaction</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Listings canceled</BulletPointItem>
          <BulletPointContent>
            <div>
              <ButtonLight
                onClick={() => {
                  setDialog(undefined);
                  navigate(`/c/${contract}`);
                }}
              >
                Ok
              </ButtonLight>
            </div>
          </BulletPointContent>
        </BulletPointList>,
      );
    }
  }, [
    isValidChainStatus,
    seaportIncrementCounterStatus,
    userOrdersQueryStatus,
    isError,
    isSuccess,
    contract,
    navigate,
    setDialog,
  ]);

  const isReady = collectionResponse!.data!.isReady;
  const collection = collectionResponse!.data!.collection;
  const tokenImages = collectionResponse!.data!.tokenImages || {};
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
              {ensName ? (
                <span>{ensName}</span>
              ) : (
                <span className="text-sm">{shortAddress(address)}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm text-zinc-400 cursor-pointer">
              <div className="hover:text-zinc-200" onClick={() => disconnect()}>
                Disconnect
              </div>
              <div className="hover:text-zinc-200" onClick={cancelAllOrders}>
                Cancel all listings
              </div>
            </div>
          </div>
          <hr className="border-zinc-800 border-2 border-t-0 -mx-8" />
          <div className="flex flex-col gap-4">
            <div className="overflow-x-hidden text-ellipsis font-medium">{collection.name}</div>
            {isReady ? (
              <div className="flex flex-col gap-8">
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
                            navigate('order/' + tokenId);
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
                    <div className="text-sm text-zinc-400">
                      Unlisted ({userUnlistedTokens.length})
                    </div>
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
            ) : (
              <div className="text-sm text-zinc-400">
                This collection is still being processed. Come back in a few minutes.
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
        <Button disabled>{`${collection.name} #${selectedTokenId || lastSelectedTokenId}`}</Button>
        <ButtonBlue
          onClick={() => {
            navigate('order/create/' + selectedTokenId);
            onNavigate();
            setSelectedTokenId(undefined);
          }}
        >
          List Item
        </ButtonBlue>
      </div>
    </Tab>
  );
}
