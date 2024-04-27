import { useContext, useEffect, useState } from 'react';
import { CollectionContext, UserAddressContext } from './App';
import {
  Button,
  ButtonAccordion,
  ButtonLight,
  CardNFTOrder,
  Checkbox,
  ExternalLink,
  ItemETH,
  ItemNFT,
  Tag,
} from './Components';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Activity, Order, WithSignature } from '../packages/order/marketplaceProtocol';
import { Navigate, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { shortAddress } from '../packages/utils';

interface Token {
  collection_id: string;
  tokenId: number;
  image?: string;
  attributes: Record<string, string>;
}

export function CollectionActivities() {
  const { data: collection } = useContext(CollectionContext);
  const [filteredAttributes, setFilteredAttributes] = useState<{ [attribute: string]: string }>({});
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const { data: activitiesData, isLoading: ActivitiesIsLoading } = useQuery<{
    data: { activities: Activity[] };
  }>({
    queryKey: ['activity', filteredTokenIds.join('-')],
    enabled: !!collection && filteredTokenIds.length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/activities/list/${collection?.contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          { collection: collection?.contract, tokenIds: filteredTokenIds },
          null,
          2,
        ),
      }).then((res) => res.json()),
  });

  const activities = activitiesData?.data.activities.map((activity) => activity) || [];

  return (
    <div className="flex flex-grow">
      <div className="w-80 bg-zinc-800 p-8 flex-shrink-0 gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <img src={collection?.image} className="w-16 h-16 rounded" />
              <div>
                <div className="text-lg font-medium">{collection?.name}</div>
                <div className="text-sm text-zinc-400">{collection?.totalSupply} items</div>
              </div>
            </div>

            <div className="flex gap-2 *:flex-grow">
              <ButtonLight onClick={() => navigate(`/c/${collection?.contract}/`)}>
                Items
              </ButtonLight>
              <ButtonLight disabled>Activity</ButtonLight>
            </div>
          </div>

          <ItemsNavigation
            filteredAttributes={filteredAttributes}
            setFilteredAttributes={setFilteredAttributes}
            setFilteredTokenIds={setFilteredTokenIds}
          ></ItemsNavigation>
        </div>
      </div>
      {ActivitiesIsLoading ? (
        <div className="w-fit p-8">Loading...</div>
      ) : (
        <ActivitiesSection
          activities={activities}
          filteredAttributes={filteredAttributes}
          setFilteredAttributes={setFilteredAttributes}
        />
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

function ActivitiesSection({
  activities,
  filteredAttributes,
  setFilteredAttributes,
}: {
  activities: Activity[];
  filteredAttributes: { [attribute: string]: string };
  setFilteredAttributes: (attributes: { [attribute: string]: string }) => void;
}) {
  const collection = useContext(CollectionContext);
  const { data: address } = useContext(UserAddressContext);
  return (
    <div className="flex-grow p-8">
      <div className="flex h-8 gap-4 items-center">
        <div>{activities.length} Results</div>
        <AttributeTags
          filteredAttributes={filteredAttributes}
          setFilteredAttributes={setFilteredAttributes}
        />
      </div>
      <div className="h-8"></div>

      {activities.length > 0 && (
        <table className="m-auto">
          <thead>
            <tr className="*:font-normal text-sm text-zinc-400 text-left">
              <th>Item</th>
              <th>Payment</th>
              <th>From</th>
              <th>To</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.txHash} className="border-b-2 border-zinc-800 *:py-4 last:border-0">
                <td className="align-top pr-8">
                  <ItemNFT src="" tokenId={Number(activity.tokenId)}></ItemNFT>
                </td>
                <td className="pr-8">
                  <div className="flex flex-col gap-2">
                    {activity.fulfillment.coin && (
                      <ItemETH value={activity.fulfillment.coin.amount} />
                    )}
                    {activity.fulfillment.token.identifier.map((tokenId) => (
                      <ItemNFT
                        key={activity.txHash.concat(tokenId)}
                        src=""
                        tokenId={Number(tokenId)}
                      />
                    ))}
                  </div>
                </td>
                <td className="text-xs align-top pr-8">
                  {activity.offerer == address ? 'You' : shortAddress(activity.offerer)}
                </td>
                <td className="text-xs align-top pr-8">
                  {activity.fulfiller == address ? 'You' : shortAddress(activity.fulfiller)}
                </td>
                <td className="text-xs align-top">
                  <ExternalLink href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}>
                    {moment(Number(activity.createdAt)).fromNow()}
                  </ExternalLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
