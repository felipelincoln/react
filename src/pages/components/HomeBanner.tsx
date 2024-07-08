import { SpinnerIcon } from './SpinnerIcon';
import { useAccount, useConnect } from 'wagmi';
import { config } from '../../config';
import { injected } from 'wagmi/connectors';
import { useQuery } from '@tanstack/react-query';
import { fetchUserCollections } from '../../api/query';
import { useNavigate } from 'react-router-dom';

export function HomeBanner() {
  return (
    <div className="bg-zinc-900 py-32 box-content border-b-2 border-zinc-800">
      <div className="max-w-screen-lg w-full mx-auto">
        <div className="flex flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-4">
            <h1 className="font-bold text-5xl">The marketplace to swap NFTs</h1>
            <h2 className="text-xl text-zinc-400">
              Create and fulfill trait-based listings using the OpenSea smart contract
            </h2>
          </div>
          <ExploreSection />
        </div>
      </div>
    </div>
  );
}

function ExploreSection() {
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
    return <></>;
  }

  if (connectStatus === 'error' || connectStatus === 'idle') {
    return (
      <div
        className="text-xl bg-cyan-400 font-bold rounded px-8 py-4 text-zinc-950 cursor-pointer"
        onClick={() => connect({ connector: injected(), chainId })}
      >
        Explore
      </div>
    );
  }

  if (connectStatus === 'pending') {
    return (
      <div className="flex flex-col gap-2 p-8 border border-zinc-600 rounded">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon />
          <div>Connect your wallet to find your NFTs</div>
        </div>
      </div>
    );
  }

  if (connectStatus === 'success' && queryStatus === 'pending') {
    return (
      <div className="flex flex-col gap-2 p-8 border border-zinc-600 rounded">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon />
          <div>Loading your NFTs...</div>
        </div>
      </div>
    );
  }

  if (userCollections.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-8 border border-zinc-600 rounded">
        <div>No supported NFT found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-8 border border-zinc-600 rounded">
      <div className="font-bold text-xl pb-2">Select to explore:</div>
      {userCollections.map((collection) => (
        <div
          key={collection.contract}
          className="hover:underline cursor-pointer"
          onClick={() => navigate(`/c/${collection.contract}`)}
        >
          <div className="flex items-center gap-2">
            <img src={collection.image} className="w-10 h-10 rounded" />
            <div>
              {collection.name} <span className="text-zinc-400">({collection.count})</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
