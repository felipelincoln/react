import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCollection } from '../../api';
import { FilterContext } from '../CollectionPage';
import { Tag } from '.';

export function AttributeTags() {
  const contract = useParams().contract!;
  const { filter, setFilter } = useContext(FilterContext);
  const { data: collectionResponse } = useQuery(fetchCollection(contract));

  const collection = collectionResponse!.data!.collection;
  return (
    <div className="flex gap-4 items-center">
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
      {Object.keys(filter).length > 0 && (
        <a
          onClick={() => {
            setFilter({});
          }}
        >
          Clear
        </a>
      )}
    </div>
  );
}
