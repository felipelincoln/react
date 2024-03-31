import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from './App';
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
import { useAccount } from 'wagmi';
import { shortAddress } from '../packages/utils';

export function CollectionActivities() {
  const collection = useContext(CollectionContext);
  const { address } = useAccount();
  const [filteredAttributes, setFilteredAttributes] = useState<{ [attribute: string]: string }>({});
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const { data: activitiesData, isLoading: ActivitiesIsLoading } = useQuery<{
    data: { activities: Activity[] };
  }>({
    queryKey: ['activity', filteredTokenIds.join('-')],
    enabled: filteredTokenIds.length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/activities/list/${collection.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          { collection: collection.address, tokenIds: filteredTokenIds },
          null,
          2,
        ),
      }).then((res) => res.json()),
  });

  const activities = activitiesData?.data.activities.map((activity) => activity) || [];

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
              <ButtonLight onClick={() => navigate(`/c/${collection.key}/`)}>Items</ButtonLight>
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
        <div className="mx-auto w-fit p-8">Loading...</div>
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
  const { address } = useAccount();
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
                <ItemNFT collection={collection} tokenId={activity.tokenId}></ItemNFT>
              </td>
              <td className="pr-8">
                <div className="flex flex-col gap-2">
                  {activity.fulfillment.coin && (
                    <ItemETH value={activity.fulfillment.coin.amount} />
                  )}
                  {activity.fulfillment.token.identifier.map((tokenId) => (
                    <ItemNFT
                      key={activity.txHash.concat(tokenId)}
                      collection={collection}
                      tokenId={tokenId}
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
    </div>
  );
}
