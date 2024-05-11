import { useQuery } from '@tanstack/react-query';
import { ExternalLink, ItemEth, ItemNft, Tab } from '.';
import { fetchCollection, fetchUserActivities, fetchUserNotifications } from '../../api/query';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import moment from 'moment';
import { config } from '../../config';

export function ActivityTab({ showTab }: { showTab: boolean }) {
  const contract = useParams().contract!;
  const { address } = useAccount();
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: userActivitiesResponse } = useQuery({
    enabled: !!address,
    ...fetchUserActivities(contract, address!),
  });
  const { data: userNotificationsResponse } = useQuery({
    enabled: !!address,
    staleTime: 12_000,
    ...fetchUserNotifications(contract, address!),
  });

  const userActivities = userActivitiesResponse?.data?.activities || [];
  const userNotifications = userNotificationsResponse?.data?.notifications || [];
  const tokenImages = collectionResponse?.data?.tokenImages!;

  return (
    <Tab hidden={!showTab}>
      <div className="mt-24 flex-grow overflow-y-auto overflow-x-hidden">
        <div className="p-8 flex flex-col gap-4">
          <div className="font-medium text-lg">Activity</div>
          {userActivities.length > 0 && (
            <table>
              <tbody>
                {userActivities.map((activity) => {
                  const isOfferer = activity.offerer == (address || '').toLowerCase();
                  const isNew = userNotifications.find(
                    (notification) => notification.activityId == activity._id,
                  );

                  return (
                    <tr
                      key={activity.txHash}
                      className="border-b-2 border-zinc-800 *:py-4 last:border-0"
                    >
                      <td className="align-top">
                        <div className="flex flex-col gap-4 text-xs text-zinc-400">
                          <div className="relative">
                            {isNew && (
                              <div className="absolute bottom-1 -left-5 h-2 w-2 rounded-full bg-cyan-400"></div>
                            )}
                            <span className={isNew ? 'font-medium text-zinc-200' : ''}>
                              {' '}
                              Item {isOfferer ? 'sold' : 'bought'}
                            </span>
                          </div>
                          <ItemNft
                            src={tokenImages[activity.tokenId]}
                            tokenId={activity.tokenId}
                          ></ItemNft>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-4">
                          <ExternalLink
                            href={`${config.eth.chain.blockExplorers.default.url}/tx/${activity.txHash}`}
                          >
                            {moment(activity.createdAt * 1000).fromNow()}
                          </ExternalLink>
                          <div className="flex flex-col gap-2">
                            {activity.fulfillment.coin && (
                              <ItemEth value={activity.fulfillment.coin.amount} />
                            )}
                            {activity.fulfillment.token.identifier.map((tokenId) => (
                              <ItemNft
                                key={activity.txHash + tokenId}
                                src={tokenImages[tokenId]}
                                tokenId={tokenId}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Tab>
  );
}
