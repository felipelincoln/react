import { useContext, useState } from 'react';
import { CollectionContext, UserTokenIdsContext } from '../App';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { TokenCard } from './TokenCard';
import { SelectableTokenCard } from './SelectableTokenCard';

type UseQueryResultData = UseQueryResult<{ data: { tokens: string[] } }>;

interface TokenFilterProps {
  tokenIds?: string[];
  selectedTokens?: string[];
  setSelectedTokens?: (tokenIds: string[]) => void;
  selectToken?: (tokenId: string) => void;
  hideCollectedTokens?: boolean;
}

const TOKENS_PER_PAGE = 20;

export function TokenFilter(props: TokenFilterProps) {
  const collection = useContext(CollectionContext);
  const userTokenIds = useContext(UserTokenIdsContext);
  const [showSelectedTokens, setShowSelectedTokens] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{ [attribute: string]: string }>({});
  const [tokensPage, setTokensPage] = useState(0);

  const tokenIds =
    showSelectedTokens && props.selectedTokens ? props.selectedTokens : props.tokenIds;

  const { data: tokensResult }: UseQueryResultData = useQuery({
    initialData: { data: { tokens: [] } },
    queryKey: [selectedFilters, tokenIds],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: selectedFilters, tokenIds }, null, 2),
      }).then((res) => res.json()),
  });

  const isTokenSelectable = !!props.selectToken;
  const isAttributeSelectable = !!props.setSelectedTokens;

  let tokens = tokensResult.data.tokens;
  if (props.hideCollectedTokens) {
    tokens = tokens.filter((tokenId) => !userTokenIds.includes(tokenId));
  }
  const tokensPaginated = tokens.slice(
    tokensPage * TOKENS_PER_PAGE,
    (tokensPage + 1) * TOKENS_PER_PAGE,
  );
  const tokensHasNextPage = tokens.length > (tokensPage + 1) * TOKENS_PER_PAGE;
  const filters = collection.attributes;
  return (
    <div>
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
      <div>
        <div className="flex gap-2">
          {Object.keys(selectedFilters).length > 0 && (
            <button
              onClick={() => {
                setSelectedFilters({});
                setTokensPage(0);
              }}
              className="bg-red-700"
            >
              Clear filters
            </button>
          )}

          {Object.keys(selectedFilters).map((attributeName) => (
            <button
              key={`${attributeName}-${selectedFilters[attributeName]}`}
              className="bg-blue-700"
              onClick={() => {
                const selectedFiltersCopy = { ...selectedFilters };
                delete selectedFiltersCopy[attributeName];
                setTokensPage(0);
                setSelectedFilters(selectedFiltersCopy);
              }}
            >
              {selectedFilters[attributeName]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          <div>{tokens.length} Results</div>
          {isAttributeSelectable && !showSelectedTokens && tokens.length > 0 && (
            <button
              className="bg-green-700"
              onClick={() =>
                props.setSelectedTokens!(
                  Array.from(new Set([...(props.selectedTokens || []), ...tokens])),
                )
              }
            >
              Select All ({tokens.length})
            </button>
          )}
          {isAttributeSelectable &&
            !showSelectedTokens &&
            (props.selectedTokens || []).length > 0 && (
              <button
                className="bg-red-700"
                onClick={() => {
                  props.setSelectedTokens!([]);
                  setShowSelectedTokens(false);
                }}
              >
                Clear selected ({props.selectedTokens?.length})
              </button>
            )}
          {isAttributeSelectable && (
            <button
              className="bg-blue-700"
              onClick={() => setShowSelectedTokens(!showSelectedTokens)}
            >
              {!showSelectedTokens ? `Show selected (${props.selectedTokens?.length})` : 'Back'}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {tokensPaginated.map((tokenId) =>
          isTokenSelectable ? (
            <div key={tokenId} className="w-1/6">
              <SelectableTokenCard
                tokenId={tokenId}
                selectToken={props.selectToken}
                isSelected={!!props.selectedTokens?.includes(tokenId)}
              ></SelectableTokenCard>
            </div>
          ) : (
            <div key={tokenId} className="w-1/6">
              <TokenCard tokenId={tokenId}></TokenCard>
            </div>
          ),
        )}
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
