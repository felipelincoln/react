import { CollectoorLogo } from '../components';

export function ErrorPage({ error }: { error: Error }) {
  const contract = window.location.pathname.split('/').at(2);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-1">
        <CollectoorLogo />
        <div>Unexpected error</div>
        <div className="font-mono bg-zinc-800 px-1">{error.message}</div>
        {contract?.startsWith('0x') && <a href={`/c/${contract}`}>back</a>}
      </div>
    </div>
  );
}
