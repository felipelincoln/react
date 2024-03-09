import { useEffect } from 'react';

interface ItemsPaginationNavbarProps {
  items: any[];
  setPaginatedItems: (items: any[]) => void;
  page: number;
  setPage: (page: number) => void;
}

const TOKENS_PER_PAGE = 10;

export function ItemsPaginationNavbar(props: ItemsPaginationNavbarProps) {
  const tokensHasNextPage = props.items.length > (props.page + 1) * TOKENS_PER_PAGE;
  const paginatedItems = props.items.slice(
    props.page * TOKENS_PER_PAGE,
    (props.page + 1) * TOKENS_PER_PAGE,
  );

  useEffect(() => props.setPaginatedItems(paginatedItems), [props.items.length, props.page]);

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
