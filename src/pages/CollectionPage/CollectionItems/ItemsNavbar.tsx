import { useContext, useState } from 'react';
import { CollectionContext } from '../../App';

interface ItemsNavbarProps {
  tokenIds: string[];
}

export function ItemsNavbar(props: ItemsNavbarProps) {
  const [showAttributesSelection, setShowAttributesSelection] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [attribute: string]: string }>({});
  const [itemsPage, setItemsPage] = useState(0);
  const { attributes } = useContext(CollectionContext);

  const tokenIds = props.tokenIds;
  let filteredTokenIds = tokenIds;

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div>{filteredTokenIds.length} Results</div>
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
          onAttributeSelect={() => setItemsPage(0)}
        ></AttributesSelection>
      )}
    </div>
  );
}

interface AttributesSelectionProps {
  selectedAttributes: { [attribute: string]: string };
  setSelectedAttributes: (attributes: { [attribute: string]: string }) => void;
  onAttributeSelect: Function;
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
                    props.onAttributeSelect();
                  } else {
                    props.setSelectedAttributes({
                      ...props.selectedAttributes,
                      [attribute]: value,
                    });
                    props.onAttributeSelect();
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
