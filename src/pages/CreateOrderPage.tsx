import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import {
  CollectionContext,
  UserTokenIdsContext,
  collectionLoader,
  collectionLoaderData,
} from './App';
import { useContext, useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useSignOrder } from '../packages/order';
import { useAccount } from 'wagmi';
import { Order } from '../packages/order/marketplaceProtocol';
import { useQuery } from '@tanstack/react-query';
import { ItemsFilterNavbar } from './CollectionPage/CollectionItems/ItemsFilterNavbar';
import { ItemsPaginationNavbar } from './CollectionPage/CollectionItems/ItemsPaginationNavbar';
import { ItemsGrid } from './CollectionPage/CollectionItems/ItemsGrid';
import { SelectableItemCard } from './CollectionPage/CollectionItems/SelectableItemCard';

interface CreateOrderLoaderData extends collectionLoaderData {
  tokenId: string;
}

export function createOrderLoader(loaderArgs: LoaderFunctionArgs): CreateOrderLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

export function CreateOrderPage() {
  const collection = useContext(CollectionContext);
  const userTokenIds = useContext(UserTokenIdsContext);
  const { tokenId } = useLoaderData() as CreateOrderLoaderData;
  const { address } = useAccount();
  const { data: signature, signOrder } = useSignOrder();
  const [ethPrice, setEthPrice] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [acceptedTokens, setAcceptedTokens] = useState<string[]>([]);
  const [acceptAnyTokenCheck, setAcceptAnyTokenCheck] = useState(false);
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);
  const navigate = useNavigate();

  const allTokenIds = collection.mintedTokens.filter((x) => !userTokenIds.includes(x));

  const signOrderArgs: Order = {
    tokenId,
    token: collection.address,
    offerer: address!,
    endTime: expireDate,
    fulfillmentCriteria: {
      coin: (Number(ethPrice) > 0 || undefined) && {
        amount: ethPrice,
      },
      token: {
        amount: tokenPrice,
        identifier: acceptAnyTokenCheck ? allTokenIds : acceptedTokens,
      },
    },
  };

  const { isSuccess } = useQuery({
    queryKey: [signature],
    retry: false,
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/orders/create/`, {
        method: 'POST',
        body: JSON.stringify({ order: { ...signOrderArgs, signature } }, null, 2),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return Promise.reject(response.json());
      }

      return response.json();
    },
    enabled: !!signature,
  });

  useEffect(() => {
    if (isSuccess) {
      navigate(`/c/${collection.key}/?myItems=1`);
    }
  }, [isSuccess]);

  function handleSelectToken(tokenId: string) {
    let tokenIds = [...acceptedTokens];
    if (tokenIds.includes(tokenId)) {
      tokenIds = tokenIds.filter((id) => id != tokenId);
    } else {
      tokenIds.push(tokenId);
    }
    setAcceptedTokens(tokenIds);
  }

  return (
    <div>
      <div>
        <div style={{ width: '100%' }}>
          <button onClick={() => navigate(`/c/${collection.key}/?myItems=1`)}>{'<'} back</button>
          <div className="flex justify-center">
            <div>
              <h2>Create order</h2>
              <div>ETH</div>
              <input
                className="text-black"
                type="number"
                min={0}
                value={ethPrice}
                onChange={(e) => setEthPrice((e.target.valueAsNumber || 0).toString())}
              />
              <div>{collection.symbol}</div>
              <input
                className="text-black"
                type="number"
                min={1}
                value={tokenPrice}
                onChange={(e) => setTokenPrice((e.target.valueAsNumber || 1).toString())}
              />
              <div>Expire Date</div>
              <input
                className="text-black"
                type="date"
                onChange={(e) => setExpireDate((e.target.valueAsNumber / 1e3).toString())}
              />
              <div>Select accepted tokens</div>
              <label>accept any</label>
              <input
                type="checkbox"
                checked={acceptAnyTokenCheck}
                onChange={() => setAcceptAnyTokenCheck(!acceptAnyTokenCheck)}
              />
            </div>
          </div>

          {!acceptAnyTokenCheck && (
            <>
              <ItemsFilterNavbar
                tokenIds={allTokenIds}
                setFilteredTokenIds={setFilteredTokenIds}
                onFilterSelect={() => setTokensPage(0)}
              ></ItemsFilterNavbar>
              <div className="flex gap-2 justify-center my-2">
                <button
                  className="bg-yellow-500 text-black"
                  onClick={() =>
                    setAcceptedTokens(Array.from(new Set([...acceptedTokens, ...filteredTokenIds])))
                  }
                >
                  Select all results
                </button>
                <button className="bg-yellow-600 text-black" onClick={() => setAcceptedTokens([])}>
                  Clear all selected
                </button>
              </div>
              <ItemsGrid>
                {paginatedTokenIds.map((tokenId) => (
                  <SelectableItemCard
                    key={tokenId}
                    tokenId={tokenId}
                    onSelect={() => handleSelectToken(tokenId)}
                    isSelected={acceptedTokens.includes(tokenId)}
                  ></SelectableItemCard>
                ))}
              </ItemsGrid>
              <ItemsPaginationNavbar
                tokenIds={filteredTokenIds}
                setPaginatedItems={setPaginatedTokenIds}
                page={tokensPage}
                setPage={setTokensPage}
              ></ItemsPaginationNavbar>
            </>
          )}

          <div className="flex bg-gray-900">
            <div className="w-1/3">
              <img className="w-full" src={`/${collection.key}/${tokenId}.png`} />
              <div className="text-center">
                {collection.name} #{tokenId}
              </div>
            </div>
            <div className="w-2/3">
              <div>You receive</div>
              {<div className="w-full bg-gray-600">{formatEther(BigInt(ethPrice))} ETH</div>}
              <div className="w-full bg-gray-600 mt-1">
                <div>
                  {tokenPrice} {collection.symbol} (
                  {acceptAnyTokenCheck ? 'any' : acceptedTokens.length})
                </div>
                <hr />
                {[]}
              </div>
              <button className="w-1/3" onClick={() => navigate(`/c/${collection.key}?myItems=1`)}>
                Cancel
              </button>
              <button
                onClick={() => signOrder(signOrderArgs)}
                className="w-2/3 bg-green-500 disabled:bg-gray-500"
                disabled={
                  (!acceptAnyTokenCheck && acceptedTokens.length < Number(tokenPrice)) ||
                  tokenPrice == '' ||
                  expireDate == ''
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
