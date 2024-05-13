import { Tag } from '.';
import { Collection } from '../../api/types';

export function AttributeTags({
  collection,
  filter,
  setFilter,
}: {
  collection?: Collection;
  filter: Record<string, string>;
  setFilter: (filter: Record<string, string>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {Object.keys(filter).map((key) => (
        <Tag
          key={`${key}-${filter[key]}`}
          onClick={() => {
            const filteredAttributesCopy = { ...filter };
            delete filteredAttributesCopy[key];
            setFilter(filteredAttributesCopy);
          }}
        >
          {`${collection?.attributeSummary[key].attribute}: ${
            collection?.attributeSummary[key].options[filter[key]]
          }`}
        </Tag>
      ))}
      {Object.keys(filter).length > 0 && <a onClick={() => setFilter({})}>Clear</a>}
    </div>
  );
}
