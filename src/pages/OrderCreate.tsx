import { useQuery } from '@tanstack/react-query';
import {
  ActionButton,
  Button,
  ButtonAccordion,
  ButtonLight,
  CardNFTSelectable,
  Checkbox,
  Dialog,
  Input,
  ItemNFT,
  Paginator,
  SpinnerIcon,
  TagLight,
  TextBox,
  Tootltip,
} from './Components';
import { Order } from '../packages/order/marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import {
  CollectionContext,
  UserAddressContext,
  UserOrdersContext,
  collectionLoader,
  collectionLoaderData,
} from './App';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { parseEther } from 'viem';
import { useGetOrderHash } from '../packages/order/hooks/useGetOrderHash';
import { useValidateChain } from '../hooks/useValidateChain';
import { useSetApprovalForAll } from '../packages/order/hooks/useSetApprovalForAll';
import { useSignOrder } from '../packages/order/hooks/useSignOrder';

interface OrderCreateLoaderData extends collectionLoaderData {
  tokenId: string;
}

export function OrderCreateLoader(loaderArgs: LoaderFunctionArgs): OrderCreateLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

// TODO: handle tx revert
// TODO: handle tx replace
// TODO: handle not enough ETH
// TODO: loading skeleton

export function OrderCreate() {
  const navigate = useNavigate();
  const { tokenId } = useLoaderData() as OrderCreateLoaderData;
  const collection = useContext(CollectionContext);
  const { data: address } = useContext(UserAddressContext);
  const { refetch: refetchUserOrders } = useContext(UserOrdersContext);
  const { orderHash, counter, getOrderHash, isPending: isOrderHashPending } = useGetOrderHash();
  const {
    isValidChain,
    switchChain,
    isPending: isSwitchChainPending,
    error: switchChainError,
  } = useValidateChain();
  const {
    hash,
    isApprovedForAll,
    setApprovalForAll,
    isPending: isSetApprovalPending,
    error: setApprovalError,
  } = useSetApprovalForAll();
  const {
    signature,
    signOrder,
    isPending: isSignOrderPending,
    error: signOrderError,
  } = useSignOrder();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [acceptAny, setAcceptAny] = useState(false);
  const [ethPrice, setEthPrice] = useState<string | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState(1);
  const [expireDays, setExpireDays] = useState(1);
  const [orderEndTime, setOrderEndTime] = useState('');
  const [filteredAttributes, setFilteredAttributes] = useState<{ [attribute: string]: string }>({});
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);

  const allTokenIds = collection.mintedTokens;
  const newOrder: Order = {
    tokenId,
    token: collection.address,
    offerer: address || '',
    endTime: orderEndTime,
    fulfillmentCriteria: {
      coin: ethPrice ? { amount: parseEther(ethPrice).toString() } : undefined,
      token: {
        amount: tokenPrice.toString(),
        identifier: acceptAny ? allTokenIds : selectedTokenIds,
      },
    },
  };

  useEffect(
    () => setOrderEndTime(moment().add(expireDays, 'days').unix().toString()),
    [expireDays],
  );

  const { isSuccess } = useQuery({
    queryKey: ['order_create'],
    retry: false,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/create/`, {
        method: 'POST',
        body: JSON.stringify({ order: { ...newOrder, signature, orderHash } }, null, 2),
        headers: { 'Content-Type': 'application/json' },
      }).then(async (response) => {
        if (!response.ok) return Promise.reject(await response.json());
        return response.json();
      }),
    enabled: !!signature && !!orderHash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetchUserOrders();
    }
  }, [isSuccess]);

  const canConfirmOrder = true;
  const errorMessage =
    switchChainError?.message || setApprovalError?.message || signOrderError?.message;
  const orderExpireTimestamp = moment().add(expireDays, 'days');

  function handleSelectToken(tokenId: string) {
    let tokenIds = [...selectedTokenIds];
    if (tokenIds.includes(tokenId)) {
      tokenIds = tokenIds.filter((id) => id != tokenId);
    } else {
      tokenIds.push(tokenId);
    }
    setSelectedTokenIds(tokenIds);
  }

  function handleConfirm() {
    setOpenConfirmDialog(true);
    getOrderHash(newOrder);
  }

  useEffect(() => {
    if (!errorMessage) return;

    setOpenConfirmDialog(false);
  }, [errorMessage]);

  useEffect(() => {
    if (!openConfirmDialog) return;
    if (isSwitchChainPending) return;
    if (isValidChain) return;

    console.log('-> switching chain');
    switchChain();
  }, [openConfirmDialog]);

  useEffect(() => {
    if (!isValidChain) return;
    if (!openConfirmDialog) return;
    if (isSetApprovalPending) return;
    if (isApprovedForAll) return;

    console.log('-> sending approval transaction');
    setApprovalForAll();
  }, [isValidChain, openConfirmDialog]);

  console.log({ counter });

  useEffect(() => {
    if (!isValidChain) return;
    if (!isApprovedForAll) return;
    if (!openConfirmDialog) return;
    if (isSignOrderPending) return;
    if (!!signature) return;
    if (!counter) return;

    console.log('-> requesting signature');
    signOrder({ ...newOrder, counter });
  }, [counter, isValidChain, isApprovedForAll || false, openConfirmDialog]);

  function dialogMessage() {
    if (signature && orderHash) {
      return (
        <div className="flex flex-col items-center gap-4">
          <div>Order created!</div>
          <ButtonLight onClick={() => navigate(`/c/${collection.key}`)}>Ok</ButtonLight>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <SpinnerIcon />
        {isSignOrderPending && <div>Confirm in your wallet</div>}
        {hash && !isSignOrderPending && <div>Approval transaction is pending</div>}
        {!hash && !isSignOrderPending && <div>Confirm in your wallet</div>}
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <Dialog title="Create order" open={openConfirmDialog}>
        <div className="flex flex-col items-center gap-4">
          <img className="rounded w-56 h-5w-56" src={`/${collection.key}/${tokenId}.png`} />
          {dialogMessage()}
        </div>
      </Dialog>
      <h1 className="pb-8">Create Order</h1>
      <div className="flex gap-12">
        <div style={{ width: 656 }} className="flex-grow">
          <div className="flex flex-col gap-4 w-52 *:flex *:flex-col *:gap-4 *:text-sm">
            <div>
              <span>ETH price</span>
              <Input type="text" onChange={(e) => setEthPrice(e.target.value)} />
            </div>
            <div>
              <span>{collection.symbol} price</span>
              <Input
                type="number"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <span>Expire days</span>
              <Input
                value={expireDays}
                type="number"
                onChange={(e) => setExpireDays(Number(e.target.value))}
              />
            </div>
            <div>
              <span className="flex items-center gap-4">
                <span className="text-sm font-medium">Selected items</span>{' '}
                <Tootltip>Selected items will be used to fulfill this order</Tootltip>
              </span>
              <div className="flex gap-2">
                <Input disabled type="text" value={acceptAny ? '-' : selectedTokenIds.length} />
                {selectedTokenIds.length > 0 && !acceptAny && (
                  <Button onClick={() => setSelectedTokenIds([])}>Clear</Button>
                )}
              </div>
              <Checkbox
                label="Accept any item"
                checked={acceptAny}
                onClick={() => setAcceptAny(!acceptAny)}
              />
            </div>
          </div>
          {!acceptAny && (
            <div className="flex flex-col gap-6 pt-8">
              <ItemsNavigation
                filteredAttributes={filteredAttributes}
                setFilteredAttributes={setFilteredAttributes}
                setFilteredTokenIds={setFilteredTokenIds}
                onAttributeSelect={() => setTokensPage(0)}
              ></ItemsNavigation>
              <div className="flex h-8 gap-4 items-center justify-between">
                <div>{filteredTokenIds.length} Results</div>
                <Button
                  onClick={() => {
                    setSelectedTokenIds(
                      Array.from(new Set([...filteredTokenIds, ...selectedTokenIds])),
                    );
                  }}
                >
                  Select all
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                {paginatedTokenIds.map((tokenId) => (
                  <CardNFTSelectable
                    key={tokenId}
                    tokenId={tokenId}
                    collection={collection}
                    onSelect={() => handleSelectToken(tokenId)}
                    selected={selectedTokenIds.includes(tokenId)}
                  />
                ))}
              </div>
              <Paginator
                items={filteredTokenIds}
                page={tokensPage}
                setItems={setPaginatedTokenIds}
                setPage={setTokensPage}
                itemsPerPage={18}
              />
            </div>
          )}
        </div>
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 text-sm bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={`/${collection.key}/${tokenId}.png`} />
            <div className="text-center text-base leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You receive</div>
            {ethPrice && <TextBox>{`${ethPrice} ETH`}</TextBox>}
            <TextBox>
              <span className="flex justify-between">
                <span className="flex-grow">{`${tokenPrice} ${collection.symbol}`}</span>
                <span className="font-sans text-zinc-400">
                  {acceptAny ? 'any' : `${selectedTokenIds.length} selected`}
                </span>
              </span>
            </TextBox>
          </div>
          <div className="flex flex-col gap-4">
            <div>Order expires</div>
            <TextBox>{orderExpireTimestamp.fromNow()}</TextBox>
          </div>
          <div className="flex items-center">
            <ActionButton disabled={!canConfirmOrder} onClick={() => handleConfirm()}>
              Confirm
            </ActionButton>
            <a className="default mx-8" onClick={() => navigate(`/c/${collection.key}`)}>
              Cancel
            </a>
          </div>
          {!!errorMessage && (
            <div className="overflow-hidden text-ellipsis red">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemsNavigation(props: {
  onAttributeSelect?: Function;
  filteredAttributes: { [attribute: string]: string };
  setFilteredAttributes: Function;
  setFilteredTokenIds: Function;
}) {
  const collection = useContext(CollectionContext);
  const [showAttributes, setShowAttributes] = useState(false);

  const { data: filteredTokenIds } = useQuery<{
    data: { tokens: string[] };
  }>({
    queryKey: ['tokens', props.filteredAttributes],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: props.filteredAttributes }, null, 2),
      }).then((res) => res.json()),
  });

  const tokenIds = filteredTokenIds?.data.tokens ?? [];
  useEffect(() => props.setFilteredTokenIds(tokenIds), [tokenIds.join('-')]);

  return (
    <div className="bg-zinc-800 rounded px-8 py-4 flex flex-col gap-4">
      <div className="flex gap-8">
        <div className="w-32 flex-shrink-0">
          <ButtonAccordion
            closed={!showAttributes}
            onClick={() => {
              setShowAttributes(!showAttributes);
            }}
          >
            Attributes
          </ButtonAccordion>
        </div>
        <AttributeTags
          filteredAttributes={props.filteredAttributes}
          setFilteredAttributes={props.setFilteredAttributes}
        />
      </div>
      {showAttributes && (
        <div className="flex justify-between h-96 pr-8 gap-4 overflow-x-scroll">
          {Object.keys(collection.attributes).map((attr, index) => (
            <div key={index}>
              <div className="flex flex-col gap-2 pb-4 relative">
                <div className="sticky left-0 top-0 pb-2 bg-zinc-800">{attr}</div>
                {collection.attributes[attr].map((val, index) => (
                  <Checkbox
                    key={index}
                    label={val}
                    checked={props.filteredAttributes[attr] === val}
                    onClick={() => {
                      if (props.filteredAttributes[attr] === val) {
                        const selectedFiltersCopy = { ...props.filteredAttributes };
                        delete selectedFiltersCopy[attr];
                        props.setFilteredAttributes(selectedFiltersCopy);
                        props.onAttributeSelect?.();
                      } else {
                        props.setFilteredAttributes({
                          ...props.filteredAttributes,
                          [attr]: val,
                        });
                        props.onAttributeSelect?.();
                      }
                    }}
                  ></Checkbox>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AttributeTagsProps {
  filteredAttributes: { [attribute: string]: string };
  setFilteredAttributes: Function;
  onAttributeSelect?: Function;
}

function AttributeTags(props: AttributeTagsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {Object.keys(props.filteredAttributes).map((attributeName) => (
        <TagLight
          key={`${attributeName}-${props.filteredAttributes[attributeName]}`}
          onClick={() => {
            const filteredAttributesCopy = { ...props.filteredAttributes };
            delete filteredAttributesCopy[attributeName];
            props.setFilteredAttributes(filteredAttributesCopy);
            props.onAttributeSelect?.();
          }}
        >
          {`${attributeName}: ${props.filteredAttributes[attributeName]}`}
        </TagLight>
      ))}
      {Object.keys(props.filteredAttributes).length > 0 && (
        <a
          onClick={() => {
            props.setFilteredAttributes({});
            props.onAttributeSelect?.();
          }}
        >
          Clear
        </a>
      )}
    </div>
  );
}
