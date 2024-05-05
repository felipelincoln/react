import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionButton,
  AttributeTags,
  Button,
  ButtonLight,
  CardNftSelectable,
  CardNftSelectableSkeleton,
  Checkbox,
  Input,
  Paginator,
  SpinnerIcon,
  TextBox,
  Tootltip,
} from './components';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchTokenIds } from '../api/query';
import { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { config } from '../config';
import { useSubmitOrder } from '../hooks';
import { DialogContext } from './App';

interface FormData {
  ethPrice?: string;
  tokenPrice: number;
  expireDays?: number;
  tokenIds: number[];
  anyTokenId: boolean;
  error?: string;
}

export function OrderCreatePage() {
  const contract = useParams().contract!;
  const tokenId = Number(useParams().tokenId!);
  const { setDialog } = useContext(DialogContext);
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: tokenIdsResponse } = useSuspenseQuery(fetchTokenIds(contract, {}));
  const [now] = useState(moment().unix());
  const [form, setForm] = useState<FormData>({
    tokenIds: [],
    anyTokenId: false,
    tokenPrice: 1,
    expireDays: 7,
  });
  const {
    submitOrder,
    //counterIsPending,
    //orderHashIsPending,
    switchChainIsPending,
    //isApprovedForAllIsPending,
    setApprovalForAllIsPending,
    setApprovalForAllReceiptIsPending,
    signTypedDataIsPending,
    mutatePostOrderIsPending,
    isSuccess,
    switchChainError,
    isApprovedForAllError,
    setApprovalForAllError,
    setApprovalForAllReceiptError,
    counterError,
    orderHashError,
    signTypedDataError,
    mutatePostOrderError,
  } = useSubmitOrder();

  useEffect(() => {
    if (!switchChainIsPending) return;

    setDialog(
      <div>
        <div className="flex flex-col items-center gap-4 max-w-lg">
          <div className="w-full font-medium pb-4">Create order</div>
          <SpinnerIcon />
          <div>Confirm in your wallet</div>
        </div>
      </div>,
    );
  }, [switchChainIsPending]);

  useEffect(() => {
    if (!setApprovalForAllIsPending) return;

    setDialog(
      <div>
        <div className="flex flex-col items-center gap-4 max-w-lg">
          <div className="w-full font-medium pb-4">Create order</div>
          <SpinnerIcon />
          <div>Confirm in your wallet</div>
        </div>
      </div>,
    );
  }, [setApprovalForAllIsPending]);

  useEffect(() => {
    if (!setApprovalForAllReceiptIsPending) return;

    setDialog(
      <div>
        <div className="flex flex-col items-center gap-4 max-w-lg">
          <div className="w-full font-medium pb-4">Create order</div>
          <SpinnerIcon />
          <div>Waiting for approval transaction to confirm...</div>
        </div>
      </div>,
    );
  }, [setApprovalForAllReceiptIsPending]);

  useEffect(() => {
    if (!signTypedDataIsPending) return;

    setDialog(
      <div>
        <div className="flex flex-col items-center gap-4 max-w-lg">
          <div className="w-full font-medium pb-4">Create order</div>
          <SpinnerIcon />
          <div>Confirm in your wallet</div>
        </div>
      </div>,
    );
  }, [signTypedDataIsPending]);

  useEffect(() => {
    if (!mutatePostOrderIsPending) return;

    setDialog(
      <div>
        <div className="flex flex-col items-center gap-4 max-w-lg">
          <div className="w-full font-medium pb-4">Create order</div>
          <SpinnerIcon />
          <div>Creating order...</div>
        </div>
      </div>,
    );
  }, [mutatePostOrderIsPending]);

  useEffect(() => {
    if (!isSuccess) return;

    setDialog(
      <div className="flex flex-col items-center gap-4">
        <div>Order created!</div>
        <ButtonLight
          onClick={() => {
            navigate(`/c/${contract}`);
            setDialog(undefined);
          }}
        >
          Ok
        </ButtonLight>
      </div>,
    );
  }, [isSuccess]);

  useEffect(() => {
    if (
      switchChainError ||
      counterError ||
      orderHashError ||
      signTypedDataError ||
      mutatePostOrderError
    ) {
      setDialog(undefined);
    }
  }, [switchChainError, counterError, orderHashError, signTypedDataError, mutatePostOrderError]);

  const collection = collectionResponse!.data!.collection;
  const tokenIds = tokenIdsResponse!.data!.tokens;
  const tokenImages = collectionResponse!.data!.tokenImages;

  function submit() {
    if (!form.expireDays) {
      setForm({ ...form, error: 'Expire days is required' });
      return;
    }
    if (form.tokenPrice > form.tokenIds.length && !form.anyTokenId) {
      setForm({
        ...form,
        error: `Selected tokens (${form.tokenIds.length}) is not enough for the ${collection.symbol} price (${form.tokenPrice})`,
      });
      return;
    }
    if (parseEther(form.ethPrice || '') == 0n && form.tokenPrice == 0) {
      setForm({
        ...form,
        error: `At least ETH price or ${collection.symbol} price must be greater than 0`,
      });
      return;
    }

    submitOrder({
      tokenId: tokenId,
      contract: collection.contract,
      offerer: address || '',
      endTime: moment(now * 1000)
        .add(form.expireDays, 'days')
        .unix(),
      fee: config.fee,
      fulfillmentCriteria: {
        coin: form.ethPrice ? { amount: parseEther(form.ethPrice).toString() } : undefined,
        token: {
          amount: form.tokenPrice.toString(),
          identifier: form.anyTokenId ? tokenIds : form.tokenIds,
        },
      },
      salt: '0',
    });
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <h1 className="pb-8">Create Order</h1>
      <div className="flex gap-12">
        <OrderCreateForm form={form} setForm={(data) => setForm({ ...data, error: undefined })} />
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={tokenImages[tokenId]} />
            <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You receive</div>
            <TextBox>{form.ethPrice || 0} ETH</TextBox>

            <TextBox>
              <span className="flex justify-between">
                <span className="flex-grow">
                  {form.tokenPrice} {collection.symbol}
                </span>
                {!!form.tokenPrice && (
                  <span className="text-zinc-400">
                    {form.anyTokenId ? 'any' : `${form.tokenIds.length} selected`}
                  </span>
                )}
              </span>
            </TextBox>
          </div>
          <div className="flex flex-col gap-4">
            <div>Order expires</div>
            <TextBox>
              {form.expireDays
                ? moment(now * 1000)
                    .add(form.expireDays, 'days')
                    .fromNow()
                : '-'}
            </TextBox>
          </div>
          <div className="flex items-center">
            <ActionButton onClick={submit}>Confirm</ActionButton>
            <a className="default mx-8" onClick={() => navigate(`/c/${contract}`)}>
              Cancel
            </a>
          </div>
          {!!form.error && <div className="overflow-hidden text-ellipsis red">{form.error}</div>}
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
          <Input
            type="text"
            value={form.ethPrice || ''}
            onChange={(e) => {
              const input = e.target.value;
              const validator = /^\d{0,4}(?:\.\d{0,18})?$/;
              const sanitizedInput =
                input.replace(',', '.').replace(/^\./, '0.').match(validator)?.[0] || '';

              if (sanitizedInput == '' && input != '') return;
              setForm({ ...form, ethPrice: sanitizedInput });
            }}
          />
        </div>
        <div>
          <span className="text-sm font-medium">{collection.symbol} price</span>
          <Input
            type="text"
            value={form.tokenPrice ?? ''}
            onChange={(e) => {
              const input = e.target.value;
              const validator = /^\d{0,4}$/;
              const sanitizedInput = input.match(validator)?.[0] || '';

              if (sanitizedInput == '' && input != '') return;
              if (Number(sanitizedInput) > 100 || Number(sanitizedInput) < 0) return;
              setForm({ ...form, tokenPrice: Number(sanitizedInput) });
            }}
          />
        </div>
        <div>
          <span className="text-sm font-medium">Expire days</span>
          <Input
            type="text"
            value={form.expireDays || ''}
            onChange={(e) => {
              const input = e.target.value;
              const validator = /^\d*$/;
              const sanitizedInput = input.match(validator)?.[0] || '';

              if (sanitizedInput == '' && input != '') return;
              if (Number(sanitizedInput) > 60 || Number(sanitizedInput) < 0) return;
              setForm({ ...form, expireDays: Number(sanitizedInput) });
            }}
          />
        </div>
        {!!form.tokenPrice && (
          <div>
            <span className="flex items-center gap-4">
              <span className="text-sm font-medium">Selected items</span>{' '}
              <Tootltip>Selected items will be used to fulfill this order</Tootltip>
            </span>
            <div className="flex gap-2">
              <Input disabled type="text" value={form.anyTokenId ? '-' : form.tokenIds.length} />
              <Button onClick={() => setForm({ ...form, tokenIds: [] })}>Clear</Button>
            </div>
            <Checkbox
              label="Accept any item"
              checked={form.anyTokenId}
              onClick={() => setForm({ ...form, anyTokenId: !form.anyTokenId })}
            />
          </div>
        )}
      </div>
      {!form.anyTokenId && !!form.tokenPrice && (
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
            <Button
              onClick={() => {
                const filteredTokenIds = tokenIds || [];
                const selectedTokenIds = Array.from(
                  new Set([...filteredTokenIds, ...form.tokenIds]),
                );
                setForm({ ...form, tokenIds: selectedTokenIds });
              }}
            >
              Select all
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            {tokenIdsIsPending
              ? Array.from({ length: 18 }).map((_, index) => (
                  <CardNftSelectableSkeleton key={index} />
                ))
              : paginatedTokenIds.map((tokenId) => (
                  <CardNftSelectable
                    key={tokenId}
                    selected={form.tokenIds.includes(tokenId)}
                    tokenId={tokenId}
                    src={tokenImages[tokenId]}
                    onSelect={() => {
                      let selectedTokens = [...form.tokenIds];
                      if (selectedTokens.includes(tokenId)) {
                        selectedTokens = selectedTokens.filter((t) => t != tokenId);
                      } else {
                        selectedTokens.push(tokenId);
                      }
                      setForm({ ...form, tokenIds: selectedTokens });
                    }}
                  />
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
      )}
    </div>
  );
}
