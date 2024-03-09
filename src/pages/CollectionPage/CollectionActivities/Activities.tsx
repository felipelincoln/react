import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Activity, With_Id } from '../../../packages/order/marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from '../../App';
import { ItemsPaginationNavbar } from '../CollectionItems/ItemsPaginationNavbar';
import { ActivitiesFeed } from './ActivitiesFeed';
import { ActivityItem } from './ActivityItem';

type UseQueryActivitiesResult = UseQueryResult<{ data: { activities: With_Id<Activity>[] } }>;

export function Activities() {
  const collection = useContext(CollectionContext);
  const [sortedActivities, setSortedActivities] = useState<With_Id<Activity>[]>([]);
  const [paginatedActivities, setPaginatedActivities] = useState<With_Id<Activity>[]>([]);
  const [activitiesPage, setActivitiesPage] = useState(0);

  const { data: activitiesResult }: UseQueryActivitiesResult = useQuery({
    initialData: { data: { activities: [] } },
    queryKey: ['activities'],
    queryFn: () =>
      fetch(`http://localhost:3000/activity/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection.address }, null, 2),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    const activitiesCopy = [...activitiesResult.data.activities];
    activitiesCopy.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    setSortedActivities(activitiesCopy);
  }, [activitiesResult.data.activities.join('-')]);

  console.log({ sortedActivities });

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
