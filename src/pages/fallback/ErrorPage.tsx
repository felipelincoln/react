import { getNavigateBackPath } from '../../utils';
import { CollectoorLogo } from '../components';

export function ErrorPage({ error }: { error: Error }) {
  const navigateBackPath = getNavigateBackPath(window.location.pathname);

  return (
    <div className="h-full flex items-center justify-center -mt-24">
      <div className="flex flex-col items-center gap-1">
        <CollectoorLogo />
        <div>Unexpected error</div>
        <div className="font-mono bg-zinc-800 px-1">{error.message}</div>
        {navigateBackPath ? <a href={navigateBackPath}>back</a> : <a href="/">home</a>}
      </div>
    </div>
  );
}
