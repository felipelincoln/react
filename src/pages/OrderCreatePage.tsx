import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionButton,
  AttributeTags,
  Button,
  ButtonAccordion,
  CardNftSelectable,
  CardNftSelectableSkeleton,
  Checkbox,
  Input,
  Paginator,
  Tag,
  TagLight,
  TextBox,
  Tootltip,
} from './components';
import { useQuery } from '@tanstack/react-query';
import { fetchCollection, fetchTokenIds } from '../api';
import { useEffect, useState } from 'react';
import moment from 'moment';

interface FormData {
  ethPrice?: string;
  tokenPrice?: string;
  expireDays?: number;
  tokens?: number[] | 'any';
}

export function OrderCreatePage() {
  const contract = useParams().contract!;
  const tokenId = Number(useParams().tokenId!);
  const navigate = useNavigate();
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const [form, setForm] = useState<FormData>({});

  const collection = collectionResponse!.data!.collection;
  const tokenImages = collectionResponse!.data!.tokenImages;
  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <h1 className="pb-8">Create Order</h1>
      <div className="flex gap-12">
        <OrderCreateForm form={form} setForm={setForm} />
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={tokenImages[tokenId]} />
            <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You receive</div>
            <TextBox>eth</TextBox>
            <TextBox>
              <span className="flex justify-between">
                <span className="flex-grow">token</span>
                <span className="text-zinc-400">any</span>
              </span>
            </TextBox>
          </div>
          <div className="flex flex-col gap-4">
            <div>Order expires</div>
            <TextBox>{moment().fromNow()}</TextBox>
          </div>
          <div className="flex items-center">
            <ActionButton>Confirm</ActionButton>
            <a className="default mx-8" onClick={() => navigate(`/c/${contract}`)}>
              Cancel
            </a>
          </div>
          <div className="overflow-hidden text-ellipsis red">error</div>
        </div>
      </div>
    </div>
  );
}

function OrderCreateForm({ form, setForm }: { form: FormData; setForm: (data: FormData) => void }) {
  const contract = useParams().contract!;
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<number[]>([]);
  const [page, setPage] = useState<number>(0);
  const { data: tokenIdsResponse, isPending: tokenIdsIsPending } = useQuery(
    fetchTokenIds(contract, filter),
  );

  const collection = collectionResponse!.data!.collection;
  const tokenImages = collectionResponse!.data!.tokenImages;
  const tokenIds = tokenIdsResponse?.data?.tokens;

  return (
    <div style={{ width: 656 }} className="flex-grow">
      <div className="flex flex-col gap-4 w-52 *:flex *:flex-col *:gap-4 *:text-sm">
        <div>
          <span className="text-sm font-medium">ETH price</span>
          <Input type="text" />
        </div>
        <div>
          <span className="text-sm font-medium">{collection.symbol} price</span>
          <Input type="number" />
        </div>
        <div>
          <span className="text-sm font-medium">Expire days</span>
          <Input type="number" />
        </div>
        <div>
          <span className="flex items-center gap-4">
            <span className="text-sm font-medium">Selected items</span>{' '}
            <Tootltip>Selected items will be used to fulfill this order</Tootltip>
          </span>
          <div className="flex gap-2">
            <Input disabled type="text" />
            <Button>Clear</Button>
          </div>
          <Checkbox label="Accept any item" />
        </div>
      </div>
      <div className="flex flex-col gap-6 pt-8">
        <div className="bg-zinc-800 rounded p-8">
          <div className="flex justify-between h-96 pr-8 gap-4 overflow-x-scroll">
            {Object.entries(collection.attributeSummary).map(([key, value]) => (
              <div key={key}>
                <div className="flex flex-col gap-2 pb-4 relative text-sm">
                  <div className="sticky left-0 top-0 pb-2 bg-zinc-800">{value.attribute}</div>
                  {Object.entries(value.options).map(([optionKey, optionValue]) => (
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-4 items-start">
            <div className="flex items-center gap-2 *:leading-8">
              {tokenIdsIsPending ? (
                <div className="animate-pulse inline-block w-8 h-6 rounded bg-zinc-800"></div>
              ) : (
                <div>{tokenIds!.length}</div>
              )}
              <div>Results</div>
            </div>
            <AttributeTags collection={collection} filter={filter} setFilter={setFilter} />
          </div>
          <Button>Select all</Button>
        </div>

        <div className="flex flex-wrap gap-4">
          {tokenIdsIsPending
            ? Array.from({ length: 18 }).map((_, index) => (
                <CardNftSelectableSkeleton key={index} />
              ))
            : paginatedTokenIds.map((tokenId) => (
                <CardNftSelectable key={tokenId} tokenId={tokenId} src={tokenImages[tokenId]} />
              ))}
        </div>
        <Paginator
          items={tokenIds || []}
          page={page}
          setItems={setPaginatedTokenIds}
          setPage={setPage}
          itemsPerPage={30}
        />
      </div>
    </div>
  );
}
