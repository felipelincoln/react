import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Activity, Notification, With_Id } from '../../../packages/order/marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import { CollectionContext, UserNotificationsContext } from '../../App';
import { ItemsPaginationNavbar } from '../CollectionItems/ItemsPaginationNavbar';
import { ActivitiesFeed } from './ActivitiesFeed';
import { useAccount } from 'wagmi';
import { ActivityItem } from './ActivityItem';

type UseQueryActivitiesResult = UseQueryResult<{ data: { activities: With_Id<Activity>[] } }>;

export function UserActivities() {
  const collection = useContext(CollectionContext);
  const userNotifications = useContext(UserNotificationsContext);
  const { address } = useAccount();
  const [sortedActivities, setSortedActivities] = useState<With_Id<Activity>[]>([]);
  const [paginatedActivities, setPaginatedActivities] = useState<With_Id<Activity>[]>([]);
  const [activitiesPage, setActivitiesPage] = useState(0);
  const [notificationsOnPage, setNotificationsOnPage] = useState<With_Id<Notification>[]>([]);

  const { data: activitiesResult }: UseQueryActivitiesResult = useQuery({
    initialData: { data: { activities: [] } },
    queryKey: [address],
    enabled: !!address,
    queryFn: () =>
      fetch(`http://localhost:3000/activity/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, collection: collection.address }, null, 2),
      }).then((res) => res.json()),
  });

  useQuery({
    queryKey: [notificationsOnPage.join('-')],
    enabled: notificationsOnPage.length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/notifications/view/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: notificationsOnPage.map((n) => n._id) }, null, 2),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    const activitiesCopy = [...activitiesResult.data.activities];
    activitiesCopy.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    setSortedActivities(activitiesCopy);
  }, [activitiesResult.data.activities.join('-')]);

  useEffect(() => {
    let visualizedNotifications = [];

    for (const notification of userNotifications) {
      if (paginatedActivities.some((activity) => activity._id === notification.activityId)) {
        visualizedNotifications.push(notification);
      }
    }

    setNotificationsOnPage(visualizedNotifications);
  }, [paginatedActivities.join('-')]);

  return (
    <div>
      <ActivitiesFeed>
        {paginatedActivities.map((activity) => (
          <ActivityItem key={activity._id} activity={activity}></ActivityItem>
        ))}
      </ActivitiesFeed>
      <ItemsPaginationNavbar
        items={sortedActivities}
        page={activitiesPage}
        setPage={setActivitiesPage}
        setPaginatedItems={setPaginatedActivities}
      ></ItemsPaginationNavbar>
    </div>
  );
}
