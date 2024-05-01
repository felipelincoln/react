import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { ActionButton, Button, CardNftSelectable, ListedNft, Tab } from '.';
import { useQuery } from '@tanstack/react-query';
import { fetchCollection, fetchUserOrders, fetchUserTokenIds } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function AccountTab({ showTab }: { showTab: boolean }) {
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
              {!!ensName ? <span>{ensName}</span> : <span className="text-sm">{address}</span>}
            </div>
            <div className="flex flex-col gap-2 text-sm text-zinc-400 cursor-pointer">
              <div className="hover:text-zinc-200" onClick={() => disconnect()}>
                Disconnect
              </div>
              {!!userOrders && userOrders.length > 1 && (
                <div className="hover:text-zinc-200" onClick={() => 'handleCancelAllOrders() TODO'}>
                  Cancel all orders ({userOrders.length})
                </div>
              )}
            </div>
          </div>
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
                    onClick={() => 'handleClickListedItem(tokenId) TODO'}
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
      <div>{selectedTokenId && <div className="h-16"></div>}</div>
      <div
        className={`fixed bottom-0 right-0 px-8 py-4 w-96 bg-zinc-800 flex gap-4 transition ease-in-out delay-0 ${
          selectedTokenId ? '' : 'translate-y-16'
        }`}
      >
        <Button disabled>{`${collection?.name} #${selectedTokenId || lastSelectedTokenId}`}</Button>
        <ActionButton onClick={() => navigate('order/new/' + selectedTokenId)}>
          List Item
        </ActionButton>
      </div>
    </Tab>
  );
}
