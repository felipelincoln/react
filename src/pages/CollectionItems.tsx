import { useContext, useEffect, useState } from 'react';
import { CollectionContext, UserBalanceContext } from './App';
import { Button, ButtonAccordion, ButtonLight, CardNFTOrder, Checkbox, Tag } from './Components';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Order, WithSignature } from '../packages/order/marketplaceProtocol';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAccount, useBalance } from 'wagmi';

export function CollectionItems() {
  const collection = useContext(CollectionContext);
  const [filteredAttributes, setFilteredAttributes] = useState<{ [attribute: string]: string }>({});
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const { data: ordersData, isLoading: orderIsLoading } = useQuery<{
    data: { orders: WithSignature<Order>[] };
  }>({
    queryKey: ['order', filteredTokenIds.join('-')],
    enabled: !!collection && filteredTokenIds.length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/${collection?.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds: filteredTokenIds }, null, 2),
      }).then((res) => res.json()),
  });

  const orders = ordersData?.data.orders.map((order) => order) || [];

  return (
    <div className="flex flex-grow">
      <div className="w-80 h-full bg-zinc-800 p-8 flex-shrink-0 gap-8">
        <div className="sticky top-32 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <img src={`/${collection.key}/thumbnail.png`} className="w-16 h-16 rounded" />
              <div>
                <div className="text-lg font-medium">{collection.name}</div>
                <div className="text-sm text-zinc-400">{collection.mintedTokens.length} items</div>
              </div>
            </div>

            <div className="flex gap-2 *:flex-grow">
              <ButtonLight disabled>Items</ButtonLight>
              <ButtonLight onClick={() => navigate(`/c/${collection.key}/activity`)}>
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
      {orderIsLoading ? (
        <div className="w-fit p-8 mx-auto">Loading...</div>
      ) : (
        <div className="flex-grow p-8">
          <div className="flex h-8 gap-4 items-center">
            <div>{orders.length} Results</div>
            <AttributeTags
              filteredAttributes={filteredAttributes}
              setFilteredAttributes={setFilteredAttributes}
            />
          </div>
          <div className="flex flex-wrap justify-between gap-4 pt-8">
            {orders.map(({ tokenId, fulfillmentCriteria }) => (
              <div key={tokenId} className="">
                <CardNFTOrder
                  priceToken={fulfillmentCriteria.token.amount}
                  priceEth={fulfillmentCriteria.coin?.amount}
                  collection={collection}
                  tokenId={tokenId}
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

type UseQueryTokensResult = UseQueryResult<{ data: { tokens: string[] } }>;

interface ItemsNavigationProps {
  onAttributeSelect?: Function;
  filteredAttributes: { [attribute: string]: string };
  setFilteredAttributes: Function;
  setFilteredTokenIds: Function;
}

function ItemsNavigation(props: ItemsNavigationProps) {
  const collection = useContext(CollectionContext);
  const [openAttribute, setOpenAttribute] = useState<string | undefined>(undefined);

  const { data: filteredTokenIds }: UseQueryTokensResult = useQuery({
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
    <div>
      <div className="font-medium pb-4">Attributes</div>
      <div className="flex flex-col">
        {Object.keys(collection.attributes).map((attr, index) => (
          <div key={index}>
            <ButtonAccordion
              closed={openAttribute != attr}
              onClick={() => setOpenAttribute(openAttribute == attr ? undefined : attr)}
            >
              {attr}
            </ButtonAccordion>
            {openAttribute == attr && (
              <div className="flex flex-col gap-2 px-4 py-2">
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
