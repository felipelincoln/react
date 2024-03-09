import { formatEther } from 'viem';
import { Activity, With_Id } from '../../../packages/order/marketplaceProtocol';
import { ItemCard } from '../CollectionItems/ItemCard';
import { useContext } from 'react';
import { UserNotificationsContext } from '../../App';

interface ActivityItemProps {
  activity: With_Id<Activity>;
}

export function ActivityItem(props: ActivityItemProps) {
  const userNotifications = useContext(UserNotificationsContext);
  const date = new Date(Number(props.activity.createdAt)).toJSON();

  const notificationsByActivityId = new Map(userNotifications.map((n) => [n.activityId, n]));
  const hasNotification = notificationsByActivityId.has(props.activity._id);

  console.log({ hasNotification });
  return (
    <div className="bg-gray-600 flex gap-2 justify-between">
      <div>
        {props.activity.etype}
        {hasNotification && (
          <span onMouseOver={() => console.log('oiiii')} className="bg-pink-600 px-1 text-sm ml-2">
            new
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <div>{props.activity.offerer}</div>
        <div className="w-12">
          <ItemCard tokenId={props.activity.tokenId}></ItemCard>
        </div>
      </div>
      <div className="flex flex-col">
        <div>{props.activity.fulfiller}</div>
        {!!props.activity.fulfillment.coin && (
          <div>{formatEther(BigInt(props.activity.fulfillment.coin.amount))} ETH</div>
        )}
        <div className="flex">
          {props.activity.fulfillment.token.identifier.map((tokenId) => (
            <div className="w-12" key={tokenId}>
              <ItemCard tokenId={tokenId}></ItemCard>
            </div>
          ))}
        </div>
      </div>
      <div>{date}</div>
    </div>
  );
}
