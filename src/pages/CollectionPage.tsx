import { CollectionHeader } from './CollectionPage/CollectionHeader';
import { CollectionItems } from './CollectionPage/CollectionItems';
import { useSearchParams } from 'react-router-dom';
import { CollectionActivity } from './CollectionPage/CollectionActivity';

export function CollectionPage() {
  const [searchParams] = useSearchParams();
  const showActivityTab = searchParams.get('activity') === '1';

  return (
    <>
      <CollectionHeader></CollectionHeader>
      {!showActivityTab && <CollectionItems></CollectionItems>}
      {showActivityTab && <CollectionActivity></CollectionActivity>}
    </>
  );
}
