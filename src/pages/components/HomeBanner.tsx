import { DiscoverSection } from './DiscoverSection';

export function HomeBanner() {
  return (
    <div className="bg-zinc-900 py-32 box-content border-b-2 border-zinc-800">
      <div className="max-w-screen-lg w-full mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4">
            <h1 className="font-bold text-5xl">The marketplace to swap NFTs</h1>
            <h2 className="text-xl text-zinc-400">
              Create trait-based listings powered by the OpenSea smart contract
            </h2>
          </div>
          <DiscoverSection />
        </div>
      </div>
    </div>
  );
}
