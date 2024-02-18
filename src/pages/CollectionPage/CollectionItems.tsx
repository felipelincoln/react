import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useState } from 'react';
import { CollectionContext, UserTokenIdsContext } from '../App';
import { useAccount } from 'wagmi';
import { TokenFilter } from '../components/TokenFilter';
import { UserItems } from './CollectionItems/UserItems';

export function CollectionItems() {
  const userTokenIds = useContext(UserTokenIdsContext);
  const { isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const isMyItems = searchParams.get('myItems') === '1' && isConnected;

  if (isMyItems) {
    return <UserItems></UserItems>;
  }

  return (
    <div>
      <TokenFilter tokenIds={isMyItems ? userTokenIds : undefined}></TokenFilter>
    </div>
  );
}
