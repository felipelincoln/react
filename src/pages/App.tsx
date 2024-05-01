import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams } from 'react-router-dom';
import { fetchCollection } from '../api';
import { ActivityTab, CollectionQueued, Dialog, Navbar } from './components';
import { ReactNode, createContext, useState } from 'react';

export const DialogContext = createContext<{
  dialog: ReactNode | undefined;
  setDialog: (element: ReactNode) => void;
}>({
  dialog: undefined,
  setDialog: () => {},
});

export function App() {
  const contract = useParams().contract!;
  const [activityTab, setActivityTab] = useState(false);
  const [accountTab, setAccountTab] = useState(false);
  const [dialog, setDialog] = useState<ReactNode | undefined>(undefined);
  const { data: response } = useSuspenseQuery(fetchCollection(contract));

  const isReady = response.data?.isReady;

  if (!isReady) {
    return <CollectionQueued />;
  }

  return (
    <DialogContext.Provider value={{ dialog, setDialog }}>
      <Dialog />
      <Navbar onClickActivity={() => setActivityTab(!activityTab)} />
      <ActivityTab showTab={activityTab} />
      <Outlet />
    </DialogContext.Provider>
  );
}
