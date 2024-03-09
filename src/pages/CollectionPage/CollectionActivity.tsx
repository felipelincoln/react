import { useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { UserActivities } from './CollectionActivities/UserActivities';
import { Activities } from './CollectionActivities/Activities';

export function CollectionActivity() {
  const { isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const isMyActivities = searchParams.get('myItems') === '1' && isConnected;

  if (isMyActivities) {
    return <UserActivities></UserActivities>;
  }

  return <Activities></Activities>;
}
