import { CollectoorLogo } from './components';

export function HomePage() {
  return (
    <div className="h-full flex items-center justify-center -mt-24">
      <div className="flex flex-col items-center gap-1">
        <CollectoorLogo />
        <div>Collectoor</div>
      </div>
    </div>
  );
}
