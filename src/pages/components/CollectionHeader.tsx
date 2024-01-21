import { useContext } from 'react';
import { CollectionContext } from '../App';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function CollectionHeader() {
  const collection = useContext(CollectionContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const myItems = searchParams.get('myItems') === '1';

  return (
    <section>
      <div>
        <h1>{collection.name}</h1>
      </div>
      <div className="flex justify-between">
        <div className="flex space-x-10">
          <div onClick={() => navigate(`/c/${collection.key}/items?myItems=${+myItems}`)}>
            Items
          </div>
          <div onClick={() => navigate(`/c/${collection.key}/activity?myItems=${+myItems}`)}>
            Activity
          </div>
        </div>
        <div className="flex space-x-1" onClick={() => navigate(`?myItems=${+!myItems}`)}>
          <div>My Items</div>
          <input checked={myItems} onChange={() => {}} type="checkbox" />
        </div>
      </div>
    </section>
  );
}
