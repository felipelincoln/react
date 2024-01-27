import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContext } from 'react';
import { CollectionContext } from '../App';

export function CollectionHeader() {
  const collection = useContext(CollectionContext);
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();

  function navigateToItems() {
    searchParams.delete('activity');
    const params = searchParams.size ? `?${searchParams.toString()}` : '';

    navigate(`/c/${collection.key}${params}`);
  }

  function navigateToActivity() {
    searchParams.set('activity', '1');
    navigate(`/c/${collection.key}?${searchParams.toString()}`);
  }

  function navigateToToggledMyItems() {
    const myItems = searchParams.get('myItems') === '1';
    if (myItems) {
      searchParams.delete('myItems');
    } else {
      searchParams.set('myItems', '1');
    }

    const params = searchParams.size ? `?${searchParams.toString()}` : '';
    navigate(`/c/${collection.key}${params}`);
  }

  return (
    <section>
      <div>
        <h1>{collection.name}</h1>
      </div>
      <div className="flex justify-between">
        <div className="flex space-x-10">
          <div onClick={navigateToItems}>Items</div>
          <div onClick={navigateToActivity}>Activity</div>
        </div>
        <div className="flex space-x-1" onClick={navigateToToggledMyItems}>
          <div>My Items</div>
          <input
            checked={searchParams.get('myItems') === '1'}
            onChange={() => {}}
            type="checkbox"
          />
        </div>
      </div>
    </section>
  );
}
