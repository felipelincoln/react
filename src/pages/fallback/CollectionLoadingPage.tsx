import { AttributeTags } from '../components';

export function CollectionLoadingPage() {
  // TODO: loading for activities
  return (
    <div className="flex-grow p-8">
      <div className="flex h-8 gap-4 items-center">
        <div className="flex items-center gap-2 *:leading-8">
          <div className="animate-pulse inline-block w-8 h-6 rounded bg-zinc-800"></div>
          <div>Results</div>
        </div>
        <AttributeTags />
      </div>
      <div className="flex flex-wrap gap-4 pt-8 animate-pulse">
        {Array.from({ length: 5 }).map((_, index) => (
          <CardNftOrderSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function CardNftOrderSkeleton() {
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
