import { CollectoorLogo } from '../components';

export function LoadingPage() {
  return (
    <div className="h-full flex items-center justify-center -mt-24">
      <div className="flex flex-col items-center animate-bounce">
        <CollectoorLogo />
        <div>Collectoor</div>
      </div>
    </div>
  );
}
