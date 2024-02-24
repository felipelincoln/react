import { useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { UserItems } from './CollectionItems/UserItems';
import { ListedItems } from './CollectionItems/ListedItems';

export function CollectionItems() {
  const { isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const isMyItems = searchParams.get('myItems') === '1' && isConnected;

  if (isMyItems) {
    return <UserItems></UserItems>;
  }

  return <ListedItems></ListedItems>;
}
