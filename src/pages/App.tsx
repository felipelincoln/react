import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams } from 'react-router-dom';
import { fetchCollection } from '../api';
import { ActivityTab, CollectionQueued, Navbar } from './components';
import { useState } from 'react';

export function App() {
  const contract = useParams().contract!;
  const [activityTab, setActivityTab] = useState(false);
  const { data: response } = useSuspenseQuery(fetchCollection(contract));

  const isReady = response.data?.isReady;

  if (!isReady) {
    return <CollectionQueued />;
  }

  return (
    <>
      <Navbar onClickActivity={() => setActivityTab(!activityTab)} />
      <ActivityTab showTab={activityTab} />
      <Outlet />
    </>
  );
}
