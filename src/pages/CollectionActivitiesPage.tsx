import { AttributeTags } from './components';

export function CollectionActivitiesPage() {
  return (
    <div className="flex-grow p-8">
      <div className="flex h-8 gap-4 items-center">
        <div className="flex items-center gap-2 *:leading-8">
          <div>0</div>
          <div>Results</div>
        </div>
        <AttributeTags />
      </div>
    </div>
  );
}
