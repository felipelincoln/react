import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { CollectionContext, collectionLoader } from './App';
import { useContext, useState } from 'react';
import { formatEther } from 'viem';
import { TokenFilter } from './components/TokenFilter';
import { useSignOrder } from '../packages/order';
import { useAccount } from 'wagmi';
import { TypedMessage } from '../packages/order/marketplaceProtocol';

interface CreateOrderLoaderData {
  tokenId: string;
}

export function createOrderLoader(loaderArgs: LoaderFunctionArgs): CreateOrderLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

export function CreateOrderPage() {
  const collection = useContext(CollectionContext);
  const { tokenId } = useLoaderData() as CreateOrderLoaderData;
  const { address } = useAccount();
  const { signOrder } = useSignOrder();
  const [ethPrice, setEthPrice] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [acceptedTokens, setAcceptedTokens] = useState<string[]>([]);
  const [acceptAnyCheck, setAcceptAnyCheck] = useState(false);
  const navigate = useNavigate();

  const signOrderArgs: Omit<TypedMessage, 'token'> = {
    tokenId,
    offerer: address!,
    endTime: expireDate,
    fulfillmentCriteria: {
      coin: (Number(ethPrice) > 0 || undefined) && {
        amount: ethPrice,
      },
      token: {
        amount: tokenPrice,
        identifier: acceptAnyCheck ? collection.mintedTokens : acceptedTokens,
      },
    },
  };

  function updateAcceptedTokenIdsClick(tokenId: string) {
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
          <button onClick={() => navigate(`/c/raccools/?myItems=1`)}>{'<'} back</button>
          <h2>Create order</h2>
          <div>ETH</div>
          <input
            className="text-black"
            type="number"
            min={0}
            value={ethPrice}
            onChange={(e) => setEthPrice((e.target.valueAsNumber || 0).toString())}
          />
          <div>Raccools</div>
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
            checked={acceptAnyCheck}
            onChange={() => setAcceptAnyCheck(!acceptAnyCheck)}
          />

          {!acceptAnyCheck && (
            <TokenFilter
              selectedTokens={acceptedTokens}
              selectToken={updateAcceptedTokenIdsClick}
              setSelectedTokens={setAcceptedTokens}
              hideCollectedTokens={true}
            ></TokenFilter>
          )}

          <div className="flex bg-gray-900">
            <div className="w-1/3">
              <img className="w-full" src={`/${collection.key}/${tokenId}.png`} />
              <div className="text-center">Raccools #{tokenId}</div>
            </div>
            <div className="w-2/3">
              <div>You receive</div>
              {<div className="w-full bg-gray-600">{formatEther(BigInt(ethPrice))} ETH</div>}
              <div className="w-full bg-gray-600 mt-1">
                <div>
                  {tokenPrice} Raccools ({acceptAnyCheck ? 'any' : acceptedTokens.length})
                </div>
                <hr />
                {[]}
              </div>
              <button className="w-1/3" onClick={() => navigate(`/collection/raccools/items`)}>
                Cancel
              </button>
              <button
                onClick={() => signOrder(signOrderArgs)}
                className="w-2/3 bg-green-500 disabled:bg-gray-500"
                disabled={
                  (!acceptAnyCheck && acceptedTokens.length < Number(tokenPrice)) ||
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
