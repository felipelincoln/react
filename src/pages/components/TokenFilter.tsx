import { useContext, useState } from 'react';
import { CollectionContext } from '../App';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

type UseQueryResultData = UseQueryResult<{ data: { tokens: string[] } }>;

interface TokenFilterProps {
  selectedTokenIds?: string[];
}

const TOKENS_PER_PAGE = 20;

export function TokenFilter(props: TokenFilterProps) {
  const collection = useContext(CollectionContext);
  const [selectedFilters, setSelectedFilters] = useState<{ [attribute: string]: string }>({});
  const [tokensPage, setTokensPage] = useState(0);
  const { data: tokensResult }: UseQueryResultData = useQuery({
    initialData: { data: { tokens: [] } },
    queryKey: [selectedFilters, props?.selectedTokenIds],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          { filters: selectedFilters, tokenIds: props?.selectedTokenIds },
          null,
          2,
        ),
      }).then((res) => res.json()),
  });

  const tokens = tokensResult.data.tokens;
  const tokensPaginated = tokens.slice(
    tokensPage * TOKENS_PER_PAGE,
    (tokensPage + 1) * TOKENS_PER_PAGE,
  );
  const tokensHasNextPage = tokens.length > (tokensPage + 1) * TOKENS_PER_PAGE;
  const filters = collection.attributes;
  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div className="flex gap-2">
            <div onClick={() => setSelectedFilters({})}>Clear filters</div>
            {Object.keys(selectedFilters).map((attributeName) => (
              <div key={`${attributeName}-${selectedFilters[attributeName]}`}>
                {selectedFilters[attributeName]}
              </div>
            ))}
          </div>
          <div>{tokens.length} Results</div>
        </div>
        <div>Attributes ({Object.keys(selectedFilters).length})</div>
      </div>
      <div className="flex">
        {Object.keys(filters).map((filter) => (
          <div key={filter}>
            <div>{filter}</div>
            <div>
              {filters[filter].sort().map((value) => (
                <div
                  key={value}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedFilters[filter] === value) {
                      const selectedFiltersCopy = { ...selectedFilters };
                      delete selectedFiltersCopy[filter];
                      setTokensPage(0);
                      setSelectedFilters(selectedFiltersCopy);
                    } else {
                      setTokensPage(0);
                      setSelectedFilters({ ...selectedFilters, [filter]: value });
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters[filter] === value}
                    onChange={() => {}}
                  />
                  <div className="inline-block">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {tokensPaginated.map((tokenId) => (
          <div className="w-1/6" key={tokenId}>
            <img src={`/${collection.key}/${tokenId}.png`} />
            <div className="text-center">{tokenId}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4">
        <button
          disabled={tokensPage === 0}
          className={tokensPage === 0 ? 'text-gray-500' : 'cursor-pointer'}
          onClick={() => setTokensPage(tokensPage + -1)}
        >
          Previous
        </button>
        <button
          disabled={!tokensHasNextPage}
          className={tokensHasNextPage ? 'cursor-pointer' : 'text-gray-500'}
          onClick={() => setTokensPage(tokensPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
