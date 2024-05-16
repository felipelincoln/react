import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams } from 'react-router-dom';
import { fetchCollection } from '../api/query';
import { AccountTab, ActivityTab, CollectionQueued, Dialog, Navbar } from './components';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export const DialogContext = createContext<{
  dialog: ReactNode | undefined;
  setDialog: (element: ReactNode) => void;
}>({
  dialog: undefined,
  setDialog: () => {},
});

export function App() {
  const contract = useParams().contract!;
  const { isConnected } = useAccount();
  const [activityTab, setActivityTab] = useState(false);
  const [accountTab, setAccountTab] = useState(false);
  const [dialog, setDialog] = useState<ReactNode | undefined>(undefined);
  const { data: response } = useSuspenseQuery(fetchCollection(contract));

  useEffect(() => {
    if (accountTab) setActivityTab(false);
  }, [accountTab]);

  useEffect(() => {
    if (activityTab) setAccountTab(false);
  }, [activityTab]);

  useEffect(() => {
    if (!isConnected) {
      setActivityTab(false);
      setAccountTab(false);
    }
  }, [isConnected]);

  const isReady = response.data?.isReady;

  if (!isReady) {
    return <CollectionQueued />;
  }

  return (
    <DialogContext.Provider value={{ dialog, setDialog }}>
      <Dialog />
      <Navbar
        activityTab={activityTab}
        onClickActivity={() => setActivityTab(!activityTab)}
        onClickAccount={() => setAccountTab(!accountTab)}
      />
      <ActivityTab showTab={activityTab} />
      <AccountTab showTab={accountTab} onNavigate={() => setAccountTab(false)} />
      <Outlet />
    </DialogContext.Provider>
  );
}
