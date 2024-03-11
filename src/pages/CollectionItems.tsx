import { useContext, useState } from 'react';
import { CollectionContext } from './App';
import { ButtonAccordion, Checkbox } from './Components';

export function CollectionItems() {
  const collection = useContext(CollectionContext);
  const [openAttribute, setOpenAttribute] = useState<string | undefined>(undefined);
  return (
    <div className="flex flex-grow">
      <div className="w-80 h-full bg-zinc-800 p-8 flex flex-col gap-8">
        <div className="flex gap-4">
          <img src={`/${collection.key}/thumbnail.png`} className="w-16 h-16 rounded" />
          <div>
            <div className="text-lg font-medium">{collection.name}</div>
            <div className="text-sm text-zinc-400">{collection.mintedTokens.length} items</div>
          </div>
        </div>
        <div>
          <div className="font-medium pb-4">Attributes</div>
          <div className="flex flex-col">
            {Object.keys(collection.attributes).map((attr) => (
              <div key={attr}>
                <ButtonAccordion
                  closed={openAttribute != attr}
                  onClick={() => setOpenAttribute(openAttribute == attr ? undefined : attr)}
                >
                  {attr}
                </ButtonAccordion>
                {openAttribute == attr && (
                  <div className="flex flex-col gap-2 px-4 py-2">
                    {collection.attributes[attr].map((value) => (
                      <Checkbox label={value}></Checkbox>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-grow">2</div>
    </div>
  );
}
