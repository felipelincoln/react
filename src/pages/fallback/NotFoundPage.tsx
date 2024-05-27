import { getNavigateBackPath } from '../../utils';
import { CollectoorLogo } from '../components';

export function NotFoundPage() {
  const navigateBackPath = getNavigateBackPath(window.location.pathname);

  return (
    <div className="h-full flex items-center justify-center -mt-24">
      <div className="flex flex-col items-center gap-1">
        <CollectoorLogo />
        <div>Not Found</div>
        {navigateBackPath ? <a href={navigateBackPath}>back</a> : <a href="/">home</a>}
      </div>
    </div>
  );
}
