import { UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  ActionButton,
  Button,
  ButtonAccordion,
  CardNFTSelectable,
  Checkbox,
  Input,
  InputDisabledWithLabel,
  Paginator,
  Tag,
  TextBox,
  TextBoxWithNFTs,
  Tootltip,
} from './Components';
import { Order, WithSignature } from '../packages/order/marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import { CollectionContext, collectionLoader, collectionLoaderData } from './App';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { etherToString } from '../packages/utils';
import moment from 'moment';
import { useFulfillOrder } from '../packages/order/useFulfillOrder';
import { useQueryUserTokenIds } from '../hooks/useQueryUserTokenIds';
import { useAccount } from 'wagmi';

interface OrderCreateLoaderData extends collectionLoaderData {
  tokenId: string;
}

export function OrderCreateLoader(loaderArgs: LoaderFunctionArgs): OrderCreateLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

// TODO: handle tx revert
// TODO: handle tx replace
// TODO: handle not enough ETH
// TODO: loading skeleton

export function OrderCreate() {
  const collection = useContext(CollectionContext);
  const { tokenId } = useLoaderData() as OrderCreateLoaderData;
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [acceptAny, setAcceptAny] = useState(false);
  const [ethPrice, setEthPrice] = useState<string | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState(1);
  const [expireDays, setExpireDays] = useState(1);
  const [filteredAttributes, setFilteredAttributes] = useState<{ [attribute: string]: string }>({});
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);
  const {
    data: userTokenIdsResult,
    isFetched: isUserTokenIdsFetched,
    isFetching: isUserTokenIdsFetching,
  } = useQueryUserTokenIds({
    collection,
  });

  const { data: ordersResult, isFetched: isOrderFetched } = useQuery<{
    data: { orders: WithSignature<Order>[] };
  }>({
    queryKey: ['order', tokenId],
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection.address, tokenIds: [tokenId] }, null, 2),
      }).then((res) => res.json()),
  });

  const allTokenIds = collection.mintedTokens.filter((t) => t != tokenId);
  const order = ordersResult?.data.orders[0];
  const orderTokenIds = order?.fulfillmentCriteria.token.identifier || [];
  const orderTokenAmount = Number(order?.fulfillmentCriteria.token.amount) || 0;
  const orderEndTimeMs = Number(order?.endTime) * 1000;
  const canConfirmOrder = true;
  const userTokenIds = userTokenIdsResult || [];
  const errorMessage = undefined;
  const orderExpireTimestamp = moment().add(expireDays, 'days');

  function handleSelectToken(tokenId: string) {
    let tokenIds = [...selectedTokenIds];
    if (tokenIds.includes(tokenId)) {
      tokenIds = tokenIds.filter((id) => id != tokenId);
    } else {
      tokenIds.push(tokenId);
    }
    setSelectedTokenIds(tokenIds);
  }

  function handleConfirm() {
    console.log('order created');
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <h1 className="pb-8">Create Order</h1>
      <div className="flex gap-12">
        <div style={{ width: 656 }} className="flex-grow">
          <div className="flex flex-col gap-4 w-52 *:flex *:flex-col *:gap-4 *:text-sm">
            <div>
              <span>ETH price</span>
              <Input type="text" onChange={(e) => setEthPrice(e.target.value)} />
            </div>
            <div>
              <span>{collection.symbol} price</span>
              <Input
                type="number"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <span>Expire days</span>
              <Input
                value={expireDays}
                type="number"
                onChange={(e) => setExpireDays(Number(e.target.value))}
              />
            </div>
            <div>
              <span className="flex items-center gap-4">
                <span className="text-sm font-medium">Selected items</span>{' '}
                <Tootltip>Selected items will be used to fulfill this order</Tootltip>
              </span>
              <Input disabled type="text" value={acceptAny ? '-' : selectedTokenIds.length} />
              <Checkbox
                label="Accept any item"
                checked={acceptAny}
                onClick={() => setAcceptAny(!acceptAny)}
              />
            </div>
          </div>
          {!acceptAny && (
            <div className="flex flex-col gap-6 pt-8">
              <ItemsNavigation
                filteredAttributes={filteredAttributes}
                setFilteredAttributes={setFilteredAttributes}
                setFilteredTokenIds={setFilteredTokenIds}
              ></ItemsNavigation>
              <div className="flex h-8 gap-4 items-center">
                <div>{filteredTokenIds.length} Results</div>
                <AttributeTags
                  filteredAttributes={filteredAttributes}
                  setFilteredAttributes={setFilteredAttributes}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                {order &&
                  paginatedTokenIds.map((tokenId) => (
                    <CardNFTSelectable
                      key={tokenId}
                      tokenId={tokenId}
                      collection={collection}
                      onSelect={() => handleSelectToken(tokenId)}
                      selected={selectedTokenIds.includes(tokenId)}
                    />
                  ))}
              </div>
              <Paginator
                items={filteredTokenIds}
                page={tokensPage}
                setItems={setPaginatedTokenIds}
                setPage={setTokensPage}
                itemsPerPage={18}
              />
            </div>
          )}
        </div>
        <div className="w-80 h-fit flex-shrink-0 text-sm bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={`/${collection.key}/${tokenId}.png`} />
            <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You receive</div>
            {ethPrice && <TextBox>{`${ethPrice} ETH`}</TextBox>}
            <TextBox>
              <span className="flex justify-between">
                <span className="flex-grow">{`${tokenPrice} ${collection.symbol}`}</span>
                <span className="font-sans text-zinc-400">
                  {acceptAny ? 'any' : `${selectedTokenIds.length} selected`}
                </span>
              </span>
            </TextBox>
          </div>
          <div className="flex flex-col gap-4">
            <div>Order expires</div>
            <TextBox>{orderExpireTimestamp.fromNow()}</TextBox>
          </div>
          <div className="flex items-center">
            <ActionButton disabled={!canConfirmOrder} onClick={() => handleConfirm()}>
              Confirm
            </ActionButton>
            <a className="default mx-8" onClick={() => navigate(`/c/${collection.key}`)}>
              Cancel
            </a>
          </div>
          {!!errorMessage && (
            <div className="overflow-hidden text-ellipsis red">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemsNavigation(props: {
  onAttributeSelect?: Function;
  filteredAttributes: { [attribute: string]: string };
  setFilteredAttributes: Function;
  setFilteredTokenIds: Function;
}) {
  const collection = useContext(CollectionContext);

  const { data: filteredTokenIds } = useQuery<{ data: { tokens: string[] } }>({
    queryKey: ['tokens', props.filteredAttributes],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: props.filteredAttributes }, null, 2),
      }).then((res) => res.json()),
  });

  const tokenIds = filteredTokenIds?.data.tokens ?? [];
  useEffect(() => props.setFilteredTokenIds(tokenIds), [tokenIds.join('-')]);

  return (
    <div className="bg-zinc-800 rounded px-8 py-4">
      <div className="flex justify-between h-96 pr-8 gap-4 overflow-x-scroll">
        {Object.keys(collection.attributes).map((attr, index) => (
          <div key={index}>
            <div className="flex flex-col gap-2 pb-4 relative">
              <div className="sticky left-0 top-0 pb-2 border-b border-b-zinc-600 bg-zinc-800">
                {attr}
              </div>
              {collection.attributes[attr].map((val, index) => (
                <Checkbox
                  key={index}
                  label={val}
                  checked={props.filteredAttributes[attr] === val}
                  onClick={() => {
                    if (props.filteredAttributes[attr] === val) {
                      const selectedFiltersCopy = { ...props.filteredAttributes };
                      delete selectedFiltersCopy[attr];
                      props.setFilteredAttributes(selectedFiltersCopy);
                      props.onAttributeSelect?.();
                    } else {
                      props.setFilteredAttributes({
                        ...props.filteredAttributes,
                        [attr]: val,
                      });
                      props.onAttributeSelect?.();
                    }
                  }}
                ></Checkbox>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AttributeTagsProps {
  filteredAttributes: { [attribute: string]: string };
  setFilteredAttributes: (attributes: { [attribute: string]: string }) => void;
  onAttributeSelect?: Function;
}

function AttributeTags(props: AttributeTagsProps) {
  return (
    <div className="flex gap-4 items-center">
      {Object.keys(props.filteredAttributes).map((attributeName) => (
        <Tag
          key={`${attributeName}-${props.filteredAttributes[attributeName]}`}
          onClick={() => {
            const filteredAttributesCopy = { ...props.filteredAttributes };
            delete filteredAttributesCopy[attributeName];
            props.setFilteredAttributes(filteredAttributesCopy);
            props.onAttributeSelect?.();
          }}
        >
          {`${attributeName}: ${props.filteredAttributes[attributeName]}`}
        </Tag>
      ))}
      {Object.keys(props.filteredAttributes).length > 0 && (
        <a
          onClick={() => {
            props.setFilteredAttributes({});
            props.onAttributeSelect?.();
          }}
        >
          Clear
        </a>
      )}
    </div>
  );
}
