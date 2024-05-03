import { AttributeTags } from '../components';

export function CollectionLoadingPage() {
  return (
    <div className="flex-grow p-8">
      <div className="flex h-8 gap-4 items-center">
        <div>
          <span className="animate-pulse inline-block h-4 w-4 my-2 bg-zinc-600 group-disabled:bg-zinc-700"></span>{' '}
          Results
        </div>
        <AttributeTags />
      </div>
    </div>
  );
}
