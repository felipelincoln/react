import { useMatch, useParams } from 'react-router-dom';
import { AttributeTags } from '../components';
import { useContext } from 'react';
import { FilterContext } from '../CollectionPage';
import { useQuery } from '@tanstack/react-query';
import { fetchCollection } from '../../api/query';

export function CollectionLoadingPage() {
  const contract = useParams().contract!;
  const activityPage = useMatch({ path: '/c/:contract/activity' });
  const { filter, setFilter } = useContext(FilterContext);
  const { data: collectionResponse } = useQuery(fetchCollection(contract));

  const collection = collectionResponse!.data!.collection;
  return (
    <div className="flex-grow p-8">
      <div className="flex h-8 gap-4 items-center">
        <div className="flex items-center gap-2 *:leading-8">
          <div className="animate-pulse inline-block w-8 h-6 rounded bg-zinc-800"></div>
          <div>Results</div>
        </div>
        <AttributeTags collection={collection} filter={filter} setFilter={setFilter} />
      </div>
      {activityPage ? (
        <div className="m-auto max-w-lg flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <ActivityItemSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 pt-8 animate-pulse">
          {Array.from({ length: 5 }).map((_, index) => (
            <CardNftOrderSkeleton key={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardNftOrderSkeleton() {
  return (
    <div className="w-48 h-full bg-zinc-800 rounded">
      <div className="px-4 py-2">
        <div className="h-6"></div>
      </div>
      <div className="h-48"></div>
      <div className="px-4 py-2">
        <div className="h-6"></div>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return <div className="w-full h-16 bg-zinc-800 animate-pulse rounded"></div>;
}
