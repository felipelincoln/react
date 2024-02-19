import { useContext, useState } from 'react';
import { ItemsFilterNavbar } from './ItemsFilterNavbar';
import { UserTokenIdsContext } from '../../App';
import { ItemsGrid } from './ItemsGrid';
import { ItemsPaginationNavbar } from './ItemsPaginationNavbar';

export function UserItems() {
  const userTokenIds = useContext(UserTokenIdsContext);
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);

  return (
    <div>
      <ItemsFilterNavbar
        tokenIds={userTokenIds}
        setFilteredTokenIds={setFilteredTokenIds}
        onFilterSelect={() => setTokensPage(0)}
      ></ItemsFilterNavbar>
      <ItemsGrid tokenIds={paginatedTokenIds}></ItemsGrid>
      <ItemsPaginationNavbar
        tokenIds={filteredTokenIds}
        setPaginatedItems={setPaginatedTokenIds}
        page={tokensPage}
        setPage={setTokensPage}
      ></ItemsPaginationNavbar>
    </div>
  );
}
