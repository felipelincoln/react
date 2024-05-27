import { Button, CollectoorLogo, Input } from './components';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectionList } from '../api/query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { isAddress } from 'viem';

export function HomePage() {
  const navigate = useNavigate();
  const [contract, setContract] = useState('');
  const [error, setError] = useState<string | undefined>();
  const { data: fetchCollectionListResponse, isLoading } = useQuery(fetchCollectionList());
  const collections = fetchCollectionListResponse?.data?.collections;

  return (
    <div className="min-h-full flex items-center justify-center -mt-24">
      <div className="flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-1">
          <CollectoorLogo />
          <div>Collectoor</div>
        </div>

        <div className="flex flex-wrap gap-1 max-w-5xl">
          {isLoading &&
            Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="w-16 h-16 rounded bg-zinc-800 animate-pulse"></div>
            ))}
          {collections?.map((collection) => (
            <img
              key={collection.contract}
              src={collection.image}
              className="w-16 h-16 rounded cursor-pointer hover:scale-125"
              onClick={() => navigate(`/c/${collection.contract}`)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div>Go to collection</div>
          <div className="flex gap-2">
            <Input
              placeholder="0x00123..."
              onChange={(e) => {
                setContract(e.target.value);
                setError(undefined);
              }}
              value={contract}
            />
            <Button
              onClick={() => {
                if (isAddress(contract)) {
                  navigate(`/c/${contract}`);
                  return;
                }

                setError('Invalid contract address');
              }}
            >
              Go
            </Button>
          </div>
          {error && <div className="text-red-400">{error}</div>}
        </div>
      </div>
    </div>
  );
}
