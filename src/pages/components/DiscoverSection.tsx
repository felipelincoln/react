import { useAccount, useConnect } from 'wagmi';
import { BulletPointContent, BulletPointItem, BulletPointList, ButtonLight } from '.';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUserCollections } from '../../api/query';
import { injected } from 'wagmi/connectors';
import { config } from '../../config';

export function DiscoverSection() {
  const { connect, status: connectStatus } = useConnect();
  const { address } = useAccount();
  const navigate = useNavigate();
  const { data, status: queryStatus } = useQuery({
    ...fetchUserCollections(address!),
    enabled: !!address && connectStatus === 'success',
  });

  const chainId = config.web3.chain.id;
  const userCollections = data?.data?.collections ?? [];

  if (!window.ethereum) {
    return <ReadMoreButton />;
  }

  if (connectStatus === 'error' || connectStatus === 'idle') {
    return (
      <div className="flex gap-x-4">
        <DiscoverButton onClick={() => connect({ connector: injected(), chainId })} />
        <ReadMoreButton />
      </div>
    );
  }

  if (connectStatus === 'pending') {
    return (
      <BulletPointList>
        <BulletPointItem ping>Connect your wallet</BulletPointItem>
        <BulletPointContent />
        <BulletPointItem disabled>Select a collection</BulletPointItem>{' '}
        <BulletPointContent>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-800 w-10 h-10 rounded" />
                  <div className="w-40">
                    <div className="h-6 w-28 bg-zinc-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BulletPointContent>
      </BulletPointList>
    );
  }

  if (connectStatus === 'success' && queryStatus === 'pending') {
    return (
      <BulletPointList>
        <BulletPointItem>Connect your wallet</BulletPointItem>
        <BulletPointContent />
        <BulletPointItem ping>Select a collection</BulletPointItem>
        <BulletPointContent>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-800 w-10 h-10 rounded animate-pulse" />
                  <div className="w-40">
                    <div className="h-6 w-28 bg-zinc-800 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BulletPointContent>
      </BulletPointList>
    );
  }

  if (userCollections.length === 0) {
    return (
      <BulletPointList>
        <BulletPointItem>Connect your wallet</BulletPointItem>
        <BulletPointContent />
        <BulletPointItem>Select a collection</BulletPointItem>
        <BulletPointContent>
          <div className="text-zinc-400 w-[424px] flex flex-col gap-2">
            <div>No supported NFT found. Try a different account</div>
            <div className="w-40">
              <ButtonLight onClick={() => connect({ connector: injected(), chainId })}>
                Retry
              </ButtonLight>
            </div>
          </div>
        </BulletPointContent>
      </BulletPointList>
    );
  }

  return (
    <BulletPointList>
      <BulletPointItem>Connect your wallet</BulletPointItem>
      <BulletPointContent />
      <BulletPointItem ping>Select a collection</BulletPointItem>
      <BulletPointContent>
        <div className="grid grid-cols-2 gap-2">
          {userCollections.map((collection) => (
            <div
              key={collection.contract}
              className="hover:underline cursor-pointer"
              onClick={() => navigate(`/c/${collection.contract}`)}
            >
              <div className="flex items-center gap-2">
                <img src={collection.image} className="w-10 h-10 rounded" />
                <div className="w-40 overflow-hidden text-ellipsis">
                  <span className="text-nowrap overflow-hidden">{collection.name}</span>
                  <span className="text-zinc-400 pl-1">({collection.count})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BulletPointContent>
    </BulletPointList>
  );
}

function ReadMoreButton() {
  return (
    <button
      type="button"
      className="h-12 px-12 text-lg rounded bg-zinc-700 text-zinc-200 whitespace-nowrap hover:bg-zinc-600"
    >
      Read more
    </button>
  );
}

function DiscoverButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick()}
      className="px-12 rounded text-lg font-bold bg-cyan-400 text-zinc-950 whitespace-nowrap hover:bg-cyan-300"
    >
      Discover
    </button>
  );
}
