import { useNavigate, useParams } from 'react-router-dom';
import {
  AttributeTags,
  BulletPointContent,
  BulletPointItem,
  BulletPointList,
  Button,
  ButtonBlue,
  ButtonLight,
  CardNftSelectable,
  CardNftSelectableSkeleton,
  Checkbox,
  Input,
  OpenSeaButton,
  Paginator,
  PriceTag,
  TextBox,
  Tootltip,
} from './components';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchTokenIds, fetchUserTokenIds } from '../api/query';
import { useCallback, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { config } from '../config';
import { useSubmitOrder } from '../hooks';
import { DialogContext } from './App';
import { NotFoundPage } from './fallback';
import { verifiedCollections } from '../verifiedCollections';
import { etherToString } from '../utils';

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

  const { data: userTokenIdsResponse, isSuccess: userTokenIdsIsSuccess } = useSuspenseQuery({
    ...fetchUserTokenIds(contract, address!),
  });

  const {
    submitOrder,
    isValidChainStatus,
    isApprovedForAllStatus,
    signatureStatus,
    postOrderStatus,
    isSuccess,
    isError,
  } = useSubmitOrder();

  const isReady = collectionResponse!.data!.isReady;
  const collection = collectionResponse!.data!.collection;
  const tokenIds = tokenIdsResponse.data?.tokens || [];
  const tokenImages = collectionResponse!.data!.tokenImages || {};
  const userTokenIds = userTokenIdsResponse?.data?.tokenIds || [];
  const fee = config.fee?.amount;
  const royalty = verifiedCollections[collection.contract]?.royalty?.amount;
  const totalEthPrice =
    parseEther(form.ethPrice || '0') + BigInt(fee || '0') + BigInt(royalty || '0');

  const ListingDetails = useCallback(() => {
    const selectedTokenIds = form.anyTokenId ? tokenIds : form.tokenIds;

    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex gap-4">
          <img
            className="w-24 h-24 rounded"
            title={tokenId.toString()}
            src={tokenImages[tokenId]}
          />
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              <span className="font-bold">Listing price:</span>
              {totalEthPrice > 0 && <PriceTag>{etherToString(totalEthPrice, false)}</PriceTag>}
              {form.tokenPrice > 0 && (
                <PriceTag>
                  {form.tokenPrice} {collection.symbol}
                </PriceTag>
              )}
            </div>

            <div className="text-xs text-zinc-400">
              <div>- Price: {etherToString(parseEther(form.ethPrice || '0'), false)}</div>
              <div>- Marketplace fee: {etherToString(BigInt(fee || '0'), false)}</div>
              <div>- Creator fee: {etherToString(BigInt(royalty || '0'), false)}</div>

              {form.tokenPrice > 0 && (
                <div>
                  - Token price: {form.tokenPrice} {collection.symbol}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedTokenIds.length > 0 && (
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-bold">Selected items:</span> {selectedTokenIds.length}
            </div>
            <div className="max-h-32 grid grid-cols-10 gap-1 overflow-y-auto">
              {selectedTokenIds.map((t) => {
                if (!tokenImages[t])
                  return (
                    <div className="w-10 h-10 bg-zinc-700 flex items-center justify-center text-xs">
                      {t}
                    </div>
                  );

                return (
                  <img className="w-10 h-10" key={t} title={t.toString()} src={tokenImages[t]} />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );

    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    collection,
    fee,
    form,
    royalty,
    tokenId,
    tokenIds.join('-'),
    Object.keys(tokenImages).join('-'),
    totalEthPrice,
  ]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (isError) {
      setDialog(undefined);
    }

    if (isValidChainStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">List item</div>
          <ListingDetails />
          <BulletPointItem ping>Check network</BulletPointItem>
          <BulletPointContent>
            <div className="text-red-400">Wrong network</div>
            <div>Continue in your wallet</div>
          </BulletPointContent>
          <BulletPointItem disabled>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Sign listing</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing created</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:read') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">List item</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Check allowance</BulletPointItem>
          <BulletPointContent>Verifying allowance...</BulletPointContent>
          <BulletPointItem disabled>Sign listing</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing created</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:write') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">List item</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Check allowance</BulletPointItem>
          <BulletPointContent>
            <div className="text-red-400">No allowance</div>
            <div>Continue in your wallet</div>
          </BulletPointContent>
          <BulletPointItem disabled>Sign listing</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing created</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (isApprovedForAllStatus == 'pending:receipt') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">List item</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Check allowance</BulletPointItem>
          <BulletPointContent>Transaction is pending...</BulletPointContent>
          <BulletPointItem disabled>Sign listing</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem disabled>Listing created</BulletPointItem>
        </BulletPointList>,
      );
    }

    if (signatureStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">List item</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Sign listing</BulletPointItem>
          <BulletPointContent>Continue in your wallet</BulletPointContent>
          <BulletPointItem disabled>Listing created</BulletPointItem>
        </BulletPointList>,
      );
      return;
    }

    if (postOrderStatus == 'pending') {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">List item</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Sign listing</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem ping>Listing created</BulletPointItem>
          <BulletPointContent>Creating the listing...</BulletPointContent>
        </BulletPointList>,
      );
      return;
    }

    if (isSuccess) {
      setDialog(
        <BulletPointList>
          <div className="text-lg font-bold pb-8">List item</div>
          <ListingDetails />
          <BulletPointItem>Check network</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Check allowance</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Sign listing</BulletPointItem>
          <BulletPointContent />
          <BulletPointItem>Listing created</BulletPointItem>
          <BulletPointContent>
            <div>
              <ButtonLight
                onClick={() => {
                  navigate(`/c/${contract}`);
                  setDialog(undefined);
                }}
              >
                Ok
              </ButtonLight>
            </div>
          </BulletPointContent>
        </BulletPointList>,
      );
    }
  }, [
    isApprovedForAllStatus,
    isValidChainStatus,
    signatureStatus,
    postOrderStatus,
    isError,
    isSuccess,
    collection,
    contract,
    navigate,
    setDialog,
    ListingDetails,
  ]);

  function submit() {
    const selectedTokenIds = form.anyTokenId ? tokenIds : form.tokenIds;

    if (!form.expireDays) {
      setForm({ ...form, error: 'Expire days is required' });
      return;
    }
    if (form.tokenPrice > selectedTokenIds.length) {
      setForm({
        ...form,
        error: `Must select at least ${form.tokenPrice} ${collection.symbol}`,
      });
      return;
    }
    if (parseEther(form.ethPrice || '') == 0n && form.tokenPrice == 0) {
      setForm({
        ...form,
        error: `ETH price and ${collection.symbol} price can't be both 0`,
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
          identifier: selectedTokenIds,
        },
      },
      salt: '0',
    });
  }

  if (
    Number.isNaN(tokenId) ||
    (userTokenIdsIsSuccess && !userTokenIds.includes(tokenId)) ||
    !isReady
  ) {
    return <NotFoundPage />;
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <div className="flex justify-between">
        <h1 className="pb-8">New listing</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate(`/c/${contract}`)}>Back</Button>
          <div>
            <OpenSeaButton contract={collection.contract} tokenId={tokenId} />
          </div>
        </div>
      </div>
      <div className="flex gap-12">
        <OrderCreateForm form={form} setForm={(data) => setForm({ ...data, error: undefined })} />
        <div>
          <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
            <div>
              {tokenImages[tokenId] ? (
                <img className="rounded w-40 h-40 mx-auto" src={tokenImages[tokenId]} />
              ) : (
                <div className="w-40 h-40 rounded bg-zinc-700 mx-auto"></div>
              )}

              <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="font-bold">You receive</div>
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
              <div className="font-bold">Listing expires</div>
              <TextBox>
                {form.expireDays
                  ? moment(now * 1000)
                      .add(form.expireDays, 'days')
                      .fromNow()
                  : '-'}
              </TextBox>
            </div>
            <div className="flex items-center">
              <ButtonBlue onClick={submit}>Confirm</ButtonBlue>
            </div>
          </div>
          {!!form.error && (
            <div className="overflow-hidden text-ellipsis red pt-8 text-center">{form.error}</div>
          )}
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
  const tokenImages = collectionResponse!.data!.tokenImages || {};
  const tokenIds = tokenIdsResponse?.data?.tokens || [];

  return (
    <div style={{ width: 656 }} className="flex-grow">
      <div className="flex flex-col gap-4 *:flex *:flex-col *:gap-4 *:text-lg">
        <div className="w-52">
          <span className="text-lg font-medium">ETH price</span>
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
        <div className="w-52">
          <span className="text-lg font-medium">{collection.symbol} price</span>
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
          <span className="text-lg font-medium">Expire days</span>
          <div className="flex flex-rap gap-2">
            <Button
              disabled={form.expireDays == 1}
              onClick={() => setForm({ ...form, expireDays: 1 })}
            >
              1 day
            </Button>
            <Button
              disabled={form.expireDays == 3}
              onClick={() => setForm({ ...form, expireDays: 3 })}
            >
              3 days
            </Button>
            <Button
              disabled={form.expireDays == 7}
              onClick={() => setForm({ ...form, expireDays: 7 })}
            >
              7 days
            </Button>
            <Button
              disabled={form.expireDays == 14}
              onClick={() => setForm({ ...form, expireDays: 14 })}
            >
              14 days
            </Button>
            <Button
              disabled={form.expireDays == 30}
              onClick={() => setForm({ ...form, expireDays: 30 })}
            >
              30 days
            </Button>
            <Button
              disabled={form.expireDays == 60}
              onClick={() => setForm({ ...form, expireDays: 60 })}
            >
              60 days
            </Button>
          </div>
        </div>
        {!!form.tokenPrice && (
          <div className="w-52">
            <span className="flex items-center gap-4">
              <span className="text-lg font-medium">Selected items</span>{' '}
              <Tootltip>Any of the selected items can fulfill this listing</Tootltip>
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
                  <div className="flex flex-col gap-2 pb-4 relative text-lg">
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
                  <div>{tokenIds.length}</div>
                )}
                <div>Results</div>
              </div>
              <AttributeTags collection={collection} filter={filter} setFilter={setFilter} />
            </div>
            <Button
              onClick={() => {
                const filteredTokenIds = tokenIds;
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
            items={tokenIds}
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
