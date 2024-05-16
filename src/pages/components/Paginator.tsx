import { useEffect } from 'react';
import { Button } from '.';

export function Paginator({
  items,
  page,
  setItems,
  setPage,
  itemsPerPage = 10,
}: {
  items: number[];
  page: number;
  setItems: (items: number[]) => void;
  setPage: (page: number) => void;
  itemsPerPage?: number;
}) {
  const pages = Array.from({ length: Math.ceil(items.length / itemsPerPage) }, (_, index) => index);

  const lastPage = pages.length - 1;
  const n = 4;

  useEffect(() => {
    const paginatedItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
    setItems(paginatedItems);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.join('-'), page, itemsPerPage, setItems]);

  return (
    <div className="flex justify-between">
      {page == n && (
        <Button key={0} onClick={() => setPage(0)}>
          {1}
        </Button>
      )}

      {page > n && (
        <div key={0} className="flex gap-2">
          <Button onClick={() => setPage(0)}>{1}</Button>
        </div>
      )}
      <div className="flex gap-2">
        {pages.map(
          (pageNumber) =>
            pageNumber < page + n &&
            pageNumber > page - n && (
              <Button
                key={pageNumber}
                disabled={pageNumber == page}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber + 1}
              </Button>
            ),
        )}
      </div>
      {page == lastPage - n && (
        <Button key={lastPage} onClick={() => setPage(lastPage)}>
          {lastPage + 1}
        </Button>
      )}

      {page < lastPage - n && (
        <div key={lastPage} className="flex gap-2">
          <Button onClick={() => setPage(lastPage)}>{lastPage + 1}</Button>
        </div>
      )}
    </div>
  );
}
