import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams } from 'react-router-dom';
import { fetchCollection } from './api';
import { CollectionQueued } from './pages/fallback';
export function App() {
  const contract = useParams().contract!;
  const { data: response } = useSuspenseQuery(fetchCollection(contract));

  const isReady = response.data?.isReady;

  if (!isReady) {
    return <CollectionQueued />;
  }

  return (
    <div>
      navbar
      <Outlet />
    </div>
  );
}
