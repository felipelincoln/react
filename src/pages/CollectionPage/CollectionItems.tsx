import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContext } from 'react';
import { CollectionContext, UserTokenIdsContext } from '../App';
import { useAccount } from 'wagmi';
import { TokenFilter } from '../components/TokenFilter';

export function CollectionItems() {
  const { isConnected } = useAccount();
  const userTokenIds = useContext(UserTokenIdsContext);
  const [searchParams] = useSearchParams();
  const showUserItemsTab = searchParams.get('myItems') === '1' && isConnected;

  return (
    <div>
      <TokenFilter selectedTokenIds={showUserItemsTab ? userTokenIds : undefined}></TokenFilter>
    </div>
  );
}
