import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from '../../App';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

interface ItemsFilterNavbarProps {
  tokenIds: string[];
  setFilteredTokenIds: (tokenIds: string[]) => void;
  onFilterSelect?: Function;
}

type UseQueryTokensResult = UseQueryResult<{ data: { tokens: string[] } }>;

export function ItemsFilterNavbar(props: ItemsFilterNavbarProps) {
  const [showAttributesSelection, setShowAttributesSelection] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [attribute: string]: string }>({});
  const collection = useContext(CollectionContext);

  const isAttributeSelected = Object.keys(selectedAttributes).length > 0;

  const { data: filteredTokenIds }: UseQueryTokensResult = useQuery({
    initialData: { data: { tokens: [] } },
    enabled: isAttributeSelected,
    queryKey: [selectedAttributes],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: selectedAttributes, tokenIds: props.tokenIds }, null, 2),
      }).then((res) => res.json()),
  });

  const tokenIds = isAttributeSelected ? filteredTokenIds?.data.tokens : props.tokenIds;
  useEffect(() => props.setFilteredTokenIds(tokenIds), [tokenIds.join('-')]);

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div>{tokenIds.length} Results</div>
          <AttributeTags
            selectedAttributes={selectedAttributes}
            setSelectedAttributes={setSelectedAttributes}
            onAttributeSelect={props.onFilterSelect}
          ></AttributeTags>
        </div>
        <div>
          <div
            className="cursor-pointer"
            onClick={() => setShowAttributesSelection(!showAttributesSelection)}
          >
            Attributes ({Object.keys(selectedAttributes).length})
          </div>
        </div>
      </div>
      {showAttributesSelection && (
        <AttributesSelection
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
          onAttributeSelect={props.onFilterSelect}
        ></AttributesSelection>
      )}
    </div>
  );
}

interface AttributeTagsProps {
  selectedAttributes: { [attribute: string]: string };
  setSelectedAttributes: (attributes: { [attribute: string]: string }) => void;
  onAttributeSelect?: Function;
}
function AttributeTags(props: AttributeTagsProps) {
  return (
    <div className="flex gap-2">
      {Object.keys(props.selectedAttributes).length > 0 && (
        <button
          onClick={() => {
            props.setSelectedAttributes({});
            props.onAttributeSelect?.();
          }}
          className="bg-red-700"
        >
          Clear filters
        </button>
      )}

      {Object.keys(props.selectedAttributes).map((attributeName) => (
        <button
          key={`${attributeName}-${props.selectedAttributes[attributeName]}`}
          className="bg-blue-700"
          onClick={() => {
            const selectedAttributesCopy = { ...props.selectedAttributes };
            delete selectedAttributesCopy[attributeName];
            props.setSelectedAttributes(selectedAttributesCopy);
            props.onAttributeSelect?.();
          }}
        >
          {props.selectedAttributes[attributeName]}
        </button>
      ))}
    </div>
  );
}

interface AttributesSelectionProps {
  selectedAttributes: { [attribute: string]: string };
  setSelectedAttributes: (attributes: { [attribute: string]: string }) => void;
  onAttributeSelect?: Function;
}

function AttributesSelection(props: AttributesSelectionProps) {
  const { attributes } = useContext(CollectionContext);

  return (
    <div className="flex">
      {Object.keys(attributes).map((attribute) => (
        <div key={attribute}>
          <div>{attribute}</div>
          <div>
            {attributes[attribute].sort().map((value) => (
              <div
                key={value}
                className="cursor-pointer"
                onClick={() => {
                  if (props.selectedAttributes[attribute] === value) {
                    const selectedFiltersCopy = { ...props.selectedAttributes };
                    delete selectedFiltersCopy[attribute];
                    props.setSelectedAttributes(selectedFiltersCopy);
                    props.onAttributeSelect?.();
                  } else {
                    props.setSelectedAttributes({
                      ...props.selectedAttributes,
                      [attribute]: value,
                    });
                    props.onAttributeSelect?.();
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={props.selectedAttributes[attribute] === value}
                  onChange={() => {}}
                />
                <div className="inline-block">{value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
