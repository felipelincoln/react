import { useEffect } from 'react';

interface ItemsPaginationNavbarProps {
  tokenIds: string[];
  setPaginatedItems: (tokenIds: string[]) => void;
  page: number;
  setPage: (page: number) => void;
}

const TOKENS_PER_PAGE = 2;

export function ItemsPaginationNavbar(props: ItemsPaginationNavbarProps) {
  const tokensHasNextPage = props.tokenIds.length > (props.page + 1) * TOKENS_PER_PAGE;
  const paginatedItems = props.tokenIds.slice(
    props.page * TOKENS_PER_PAGE,
    (props.page + 1) * TOKENS_PER_PAGE,
  );

  useEffect(() => props.setPaginatedItems(paginatedItems), [paginatedItems.join('-')]);

  return (
    <div className="flex justify-center gap-4">
      <button
        disabled={props.page === 0}
        className={props.page === 0 ? 'text-gray-500' : 'cursor-pointer'}
        onClick={() => props.setPage(props.page - 1)}
      >
        Previous
      </button>
      <button
        disabled={!tokensHasNextPage}
        className={tokensHasNextPage ? 'cursor-pointer' : 'text-gray-500'}
        onClick={() => props.setPage(props.page + 1)}
      >
        Next
      </button>
    </div>
  );
}
