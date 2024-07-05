import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { ActivityTableRow, AttributeTags } from './components';
import { fetchActivities, fetchCollection, fetchTokenIds } from '../api/query';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import { FilterContext } from './CollectionPage';
import { useAccount } from 'wagmi';

export function CollectionActivitiesPage() {
  const { filter, setFilter } = useContext(FilterContext);
  const contract = useParams().contract!;
  const { address } = useAccount();
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: tokenIdsResponse } = useSuspenseQuery(fetchTokenIds(contract, filter));
  const { data: activitiesResponse } = useSuspenseQuery(
    fetchActivities(contract, tokenIdsResponse.data?.tokens || []),
  );

  const collection = collectionResponse!.data!.collection;
  const tokenImages = collectionResponse!.data!.tokenImages || {};
  const activities = activitiesResponse.data?.activities;

  return (
    <div className="flex-grow p-8 gap-8">
      <div className="flex h-8 gap-4 items-center">
        <div className="flex items-center gap-2 *:leading-8">
          <div>{activities?.length}</div>
          <div>Results</div>
        </div>
        <AttributeTags collection={collection} filter={filter} setFilter={setFilter} />
      </div>
      {activities && activities.length > 0 && (
        <table className="m-auto mt-8">
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
              <ActivityTableRow
                key={activity._id}
                activity={activity}
                tokenImages={tokenImages}
                userAddress={address}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
