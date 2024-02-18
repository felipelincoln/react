import { useContext } from 'react';
import { ItemsNavbar } from './ItemsNavbar';
import { UserTokenIdsContext } from '../../App';

export function UserItems() {
  const userTokenIds = useContext(UserTokenIdsContext);

  return (
    <div>
      <ItemsNavbar tokenIds={userTokenIds}></ItemsNavbar>
    </div>
  );
}
