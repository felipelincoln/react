import { useContext, useEffect, useMemo, useState } from 'react';
import {
  CollectionContext,
  UserAddressContext,
  UserBalanceContext,
  UserTokensContext,
} from './App';
import { Button, ButtonAccordion, ButtonLight, CardNFTOrder, Checkbox, Tag } from './Components';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Order, WithSignature } from '../packages/order/marketplaceProtocol';
import { Navigate, useNavigate } from 'react-router-dom';
import { userCanFulfillOrder } from '../packages/utils';

interface Token {
  collection_id: string;
  tokenId: number;
  image?: string;
  attributes: Record<string, string>;
}

export function CollectionItems() {
  const { data: collection } = useContext(CollectionContext);
  const userTokens = useContext(UserTokensContext);
  const userBalance = useContext(UserBalanceContext);
  const userAddress = useContext(UserAddressContext);
  const [filteredAttributes, setFilteredAttributes] = useState<{ [attribute: string]: string }>({});
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const navigate = useNavigate();

  console.log({ filteredTokenIds });

  const { data: ordersData, isLoading: ordersIsLoading } = useQuery<{
    data?: { orders: WithSignature<Order>[] };
    error?: string;
  }>({
    queryKey: ['order', filteredTokenIds.join('-')],
    enabled: !!collection && filteredTokenIds.length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/${collection?.contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds: filteredTokenIds }, null, 2),
      }).then((res) => res.json()),
  });

  const orders = useMemo(() => {
    if (!ordersData || !ordersData.data) return [];
    if (!userAddress.data) return ordersData.data.orders;
    if (!userTokens.data) return ordersData.data.orders;
    if (!userBalance.data) return ordersData.data.orders;
    const userTokenIds = userTokens.data.map((t) => t.tokenId);

    const ordersCopy = [...ordersData.data.orders];
    ordersCopy.sort((a, b) => {
      const tokenPriceA = Number(a.fulfillmentCriteria.token.amount);
      const tokenPriceB = Number(b.fulfillmentCriteria.token.amount);
      const coinPriceA = BigInt(a.fulfillmentCriteria.coin?.amount || '0');
      const coinPriceB = BigInt(b.fulfillmentCriteria.coin?.amount || '0');

      const userCanFulfillA = userCanFulfillOrder(
        a,
        userTokenIds,
        userBalance.data,
        userAddress.data,
      );
      const userCanFulfillB = userCanFulfillOrder(
        b,
        userTokenIds,
        userBalance.data,
        userAddress.data,
      );

      if (userCanFulfillA && !userCanFulfillB) {
        return -1;
      } else if (!userCanFulfillA && userCanFulfillB) {
        return 1;
      }

      if (tokenPriceA !== tokenPriceB) {
        return tokenPriceA - tokenPriceB;
      }

      if (coinPriceA !== coinPriceB) {
        return coinPriceA < coinPriceB ? -1 : 1;
      }

      return 0;
    });

    console.log('-> sorting feed');

    return ordersCopy;
  }, [ordersData, userTokens.data, userBalance.data, userAddress.data]);

  if (!collection) {
    return <></>;
  }

  const ordersError = ordersData?.error;

  return (
    <div className="flex flex-grow">
      <div className="w-80 bg-zinc-800 p-8 flex-shrink-0 gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <img src={collection.image} className="w-16 h-16 rounded" />
              <div>
                <div className="text-lg font-medium">{collection.name}</div>
                <div className="text-sm text-zinc-400">{collection.totalSupply} items</div>
              </div>
            </div>

            <div className="flex gap-2 *:flex-grow">
              <ButtonLight disabled>Items</ButtonLight>
              <ButtonLight onClick={() => navigate(`/c/${collection.contract}/activity`)}>
                Activity
              </ButtonLight>
            </div>
          </div>

          <ItemsNavigation
            filteredAttributes={filteredAttributes}
            setFilteredAttributes={setFilteredAttributes}
            setFilteredTokenIds={setFilteredTokenIds}
          ></ItemsNavigation>
        </div>
      </div>
      {ordersIsLoading && !ordersError ? (
        <div className="w-fit p-8">Loading...</div>
      ) : (
        <div className="flex-grow p-8">
          <div className="flex h-8 gap-4 items-center">
            <div>{orders.length} Results</div>
            <AttributeTags
              filteredAttributes={filteredAttributes}
              setFilteredAttributes={setFilteredAttributes}
            />
          </div>
          <div className="flex flex-wrap gap-4 pt-8">
            {orders.map((order) => (
              <div key={order.tokenId} className="">
                <CardNFTOrder
                  priceToken={order.fulfillmentCriteria.token.amount}
                  priceEth={order.fulfillmentCriteria.coin?.amount}
                  contract={collection.contract}
                  symbol={collection.symbol}
                  src=""
                  tokenId={Number(order.tokenId)}
                  canFullfill={userCanFulfillOrder(
                    order,
                    userTokens.data?.map((t) => t.tokenId),
                    userBalance.data,
                    userAddress.data,
                  )}
                ></CardNFTOrder>
              </div>
            ))}
            <div className="flex-grow"></div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ItemsNavigationProps {
  onAttributeSelect?: Function;
  filteredAttributes: { [attribute: string]: string };
  setFilteredAttributes: Function;
  setFilteredTokenIds: Function;
}

function ItemsNavigation(props: ItemsNavigationProps) {
  const { data: collection } = useContext(CollectionContext);
  const [openAttribute, setOpenAttribute] = useState<string | undefined>(undefined);

  const { data: filteredTokenIds } = useQuery<{ data?: { tokens: Token[]; error?: string } }>({
    queryKey: ['tokens', props.filteredAttributes],
    enabled: !!collection,
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection?.contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: props.filteredAttributes }, null, 2),
      }).then((res) => res.json()),
  });

  const tokenIds = filteredTokenIds?.data?.tokens ?? [];
  useEffect(() => props.setFilteredTokenIds(tokenIds.map((t) => t.tokenId)), [tokenIds.join('-')]);

  if (!collection) {
    return <></>;
  }

  return (
    <div>
      <div className="font-medium pb-4">Attributes</div>
      <div className="flex flex-col">
        {Object.entries(collection.attributeSummary).map(([key, value]) => (
          <div key={key}>
            <ButtonAccordion
              closed={openAttribute != key}
              onClick={() => setOpenAttribute(openAttribute == key ? undefined : key)}
            >
              {value.attribute}
            </ButtonAccordion>
            {openAttribute == key && (
              <div className="flex flex-col gap-2 px-4 py-2">
                {Object.entries(value.options).map(([optionKey, optionValue]) => (
                  <Checkbox
                    key={optionKey}
                    label={optionValue}
                    checked={props.filteredAttributes[key] === optionKey}
                    onClick={() => {
                      if (props.filteredAttributes[key] === optionKey) {
                        const selectedFiltersCopy = { ...props.filteredAttributes };
                        delete selectedFiltersCopy[key];
                        props.setFilteredAttributes(selectedFiltersCopy);
                        props.onAttributeSelect?.();
                      } else {
                        props.setFilteredAttributes({
                          ...props.filteredAttributes,
                          [key]: optionKey,
                        });
                        props.onAttributeSelect?.();
                      }
                    }}
                  ></Checkbox>
                ))}
              </div>
            )}
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
  const { data: collection } = useContext(CollectionContext);
  return (
    <div className="flex gap-4 items-center">
      {Object.keys(props.filteredAttributes).map((key) => (
        <Tag
          key={`${key}-${props.filteredAttributes[key]}`}
          onClick={() => {
            const filteredAttributesCopy = { ...props.filteredAttributes };
            delete filteredAttributesCopy[key];
            props.setFilteredAttributes(filteredAttributesCopy);
            props.onAttributeSelect?.();
          }}
        >
          {`${collection?.attributeSummary[key].attribute}: ${
            collection?.attributeSummary[key].options[props.filteredAttributes[key]]
          }`}
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
