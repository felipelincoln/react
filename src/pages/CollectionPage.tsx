import { useQuery } from "@tanstack/react-query";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { fetchCollection } from "../api/query";
import { Button, ButtonAccordion, Checkbox } from "./components";
import { Suspense, createContext, useState } from "react";
import { CollectionLoadingPage } from "./fallback";

export const FilterContext = createContext<{
  filter: Record<string, string>;
  setFilter: (filter: Record<string, string>) => void;
}>({ filter: {}, setFilter: () => {} });

export function CollectionPage() {
  const contract = useParams().contract!;
  const navigate = useNavigate();
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const [openAttribute, setOpenAttribute] = useState<string | undefined>(
    undefined,
  );
  const [filter, setFilter] = useState<Record<string, string>>({});

  const collection = collectionResponse!.data!.collection;
  return (
    <div className="flex flex-grow">
      <div className="w-80 bg-zinc-900 p-8 flex-shrink-0 gap-8 border-r border-zinc-800">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <img src={collection.image} className="w-16 h-16 rounded" />
              <div>
                <div className="text-lg font-medium">{collection.name}</div>
                <div className="text-sm text-zinc-400">
                  {collection.totalSupply} items
                </div>
              </div>
            </div>

            <div className="flex gap-2 *:flex-grow">
              <Button onClick={() => navigate(`/c/${collection.contract}`)}>
                Items
              </Button>
              <Button
                onClick={() => navigate(`/c/${collection.contract}/activity`)}
              >
                Activity
              </Button>
            </div>
          </div>
          <div>
            <div className="font-medium pb-4">Attributes</div>
            <div className="flex flex-col">
              {Object.entries(collection.attributeSummary).map(
                ([key, value]) => (
                  <div key={key}>
                    <ButtonAccordion
                      closed={openAttribute != key}
                      onClick={() =>
                        setOpenAttribute(openAttribute == key ? undefined : key)
                      }
                    >
                      {value.attribute}
                    </ButtonAccordion>
                    {openAttribute == key && (
                      <div className="flex flex-col gap-2 px-4 py-2">
                        {Object.entries(value.options).map(
                          ([optionKey, optionValue]) => (
                            <Checkbox
                              key={optionKey}
                              label={optionValue}
                              checked={filter[key] === optionKey}
                              onClick={() => {
                                if (filter[key] === optionKey) {
                                  const selectedFiltersCopy = { ...filter };
                                  delete selectedFiltersCopy[key];
                                  setFilter(selectedFiltersCopy);
                                } else {
                                  setFilter({
                                    ...filter,
                                    [key]: optionKey,
                                  });
                                }
                              }}
                            ></Checkbox>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      <FilterContext.Provider value={{ filter, setFilter }}>
        <Suspense fallback={<CollectionLoadingPage />}>
          <Outlet />
        </Suspense>
      </FilterContext.Provider>
    </div>
  );
}
