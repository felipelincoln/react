import { CollectoorLogo } from '../components';

export function NotFoundPage() {
  const contract = window.location.pathname.split('/').at(2);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-1">
        <CollectoorLogo />
        <div>Not Found</div>
        {contract?.startsWith('0x') && <a href={`/c/${contract}`}>back</a>}
      </div>
    </div>
  );
}
