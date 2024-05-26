import { CollectoorLogo } from './components';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectionList } from '../api/query';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { data: fetchCollectionListResponse, isLoading } = useQuery(fetchCollectionList());
  const collections = fetchCollectionListResponse?.data?.collections;

  return (
    <div className="min-h-full flex items-center justify-center -mt-24">
      <div className="flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-1">
          <CollectoorLogo />
          <div>Collectoor</div>
          <div className="text-zinc-400">The easiest way to trade nfts for nfts</div>
        </div>

        <div className="flex flex-wrap gap-1 max-w-5xl">
          {isLoading &&
            Array.from({ length: 9 }).map(() => (
              <div className="w-16 h-16 rounded bg-zinc-800 animate-pulse"></div>
            ))}
          {collections?.map((collection) => (
            <img
              key={collection._id}
              src={collection.image}
              className="w-16 h-16 rounded  cursor-pointer hover:scale-125"
              onClick={() => navigate(`/c/${collection.contract}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
