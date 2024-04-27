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
  UserTokensContext,
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
import { getRandomInt } from '../packages/utils';
import { config } from '../config';
import NotFoundPage from './NotFound';

const ITEMS_PER_PAGE = 36;

interface OrderCreateLoaderData extends collectionLoaderData {
  tokenId: number;
}

interface Token {
  collection_id: string;
  tokenId: number;
  image?: string;
  attributes: Record<string, string>;
}

export function OrderCreateLoader(loaderArgs: LoaderFunctionArgs): OrderCreateLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = Number(loaderArgs.params.tokenId!);

  return { tokenId, ...collectionLoaderResult };
}

function range(start: number, end: number) {
  return Array.from({ length: end }, (_, index) => String(index + start));
}

// TODO: handle tx revert
// TODO: handle tx replace

export function OrderCreate() {
  const navigate = useNavigate();
  const { tokenId } = useLoaderData() as OrderCreateLoaderData;
  const { data: userTokens } = useContext(UserTokensContext);
  const { data: collection } = useContext(CollectionContext);
  const { data: address } = useContext(UserAddressContext);
  const { refetch: refetchUserOrders } = useContext(UserOrdersContext);
  const { orderHash, counter, getOrderHash } = useGetOrderHash();
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
  } = useSetApprovalForAll({ contract: collection?.contract as `0x${string}` });
  const {
    signature,
    signOrder,
    isPending: isSignOrderPending,
    error: signOrderError,
  } = useSignOrder();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [acceptAny, setAcceptAny] = useState(false);
  const [ethPrice, setEthPrice] = useState<string | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState(1);
  const [expireDays, setExpireDays] = useState(1);
  const [orderEndTime, setOrderEndTime] = useState('');
  const [filteredAttributes, setFilteredAttributes] = useState<{ [attribute: string]: string }>({});
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [paginatedTokens, setPaginatedTokens] = useState<Token[]>([]);
  const [tokensPage, setTokensPage] = useState(0);
  const [orderSalt] = useState(getRandomInt().toString());

  const token = userTokens?.find((t) => t.tokenId == tokenId);

  const newOrder: Order = {
    tokenId: tokenId.toString(),
    token: collection?.contract || '', // TODO:
    offerer: address || '',
    endTime: orderEndTime,
    salt: orderSalt,
    fee: config.fee,
    fulfillmentCriteria: {
      coin: ethPrice ? { amount: parseEther(ethPrice).toString() } : undefined,
      token: {
        amount: tokenPrice.toString(),
        identifier: acceptAny
          ? range(0, Number(collection?.totalSupply))
          : selectedTokens.map((t) => t.tokenId.toString()),
      },
    },
  };

  useEffect(
    () => setOrderEndTime(moment().add(expireDays, 'days').unix().toString()),
    [expireDays],
  );

  const {
    isSuccess,
    error: createOrderError,
    data,
  } = useQuery({
    queryKey: ['order_create'],
    retry: false,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/create/`, {
        method: 'POST',
        body: JSON.stringify({ order: { ...newOrder, signature, orderHash } }, null, 0),
        headers: { 'Content-Type': 'application/json' },
      }).then(async (response) => {
        if (!response.ok) {
          const { error } = await response.json();
          return Promise.reject({ message: error });
        }
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
    switchChainError?.message ||
    setApprovalError?.message ||
    signOrderError?.message ||
    createOrderError?.message;
  const orderExpireTimestamp = moment().add(expireDays, 'days');

  function handleSelectToken(token: Token) {
    let tokens = [...selectedTokens];
    if (tokens.includes(token)) {
      tokens = tokens.filter((t) => t.tokenId != token.tokenId);
    } else {
      tokens.push(token);
    }
    setSelectedTokens(tokens);
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

  function handleUserInputEthPrice(input: string) {
    const validator = /^\d{0,4}(?:\.\d{0,18})?$/;
    const sanitizedInput = input.replace(',', '.').match(validator)?.[0] || '';

    if (sanitizedInput == '' && input != '') return;
    setEthPrice(sanitizedInput);
  }

  function handleUserInputTokenPrice(input: string) {
    const validator = /^\d{0,4}$/;
    const sanitizedInput = input.match(validator)?.[0] || '';

    if (sanitizedInput == '' && input != '') return;
    setTokenPrice(Number(sanitizedInput));
  }

  function handleUserInputExpireDays(input: string) {
    const validator = /^\d*$/;
    const sanitizedInput = input.match(validator)?.[0] || '';

    if (sanitizedInput == '' && input != '') return;
    if (Number(sanitizedInput) > 30 || Number(sanitizedInput) < 1) return;
    setExpireDays(Number(sanitizedInput));
  }

  function dialogMessage() {
    if (signature && orderHash && isSuccess) {
      return (
        <div className="flex flex-col items-center gap-4">
          <div>Order created!</div>
          <ButtonLight onClick={() => navigate(`/c/${collection?.contract}`)}>Ok</ButtonLight>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4">
        <SpinnerIcon />
        {isSignOrderPending && <div>Confirm in your wallet</div>}
        {hash && !isSignOrderPending && <div>Approval transaction is pending...</div>}
        {!hash && !isSignOrderPending && <div>Confirm in your wallet</div>}
      </div>
    );
  }

  if (!token) {
    return <NotFoundPage></NotFoundPage>;
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <Dialog title="Create order" open={openConfirmDialog}>
        <div className="flex flex-col items-center gap-4">
          <img className="rounded w-56 h-5w-56" src={token.image} />
          {dialogMessage()}
        </div>
      </Dialog>
      <h1 className="pb-8">Create Order</h1>
      <div className="flex gap-12">
        <div style={{ width: 656 }} className="flex-grow">
          <div className="flex flex-col gap-4 w-52 *:flex *:flex-col *:gap-4 *:text-sm">
            <div>
              <span>ETH price</span>
              <Input
                type="text"
                onChange={(e) => handleUserInputEthPrice(e.target.value)}
                value={ethPrice || ''}
              />
            </div>
            <div>
              <span>{collection?.symbol} price</span>
              <Input
                type="number"
                value={tokenPrice}
                onChange={(e) => handleUserInputTokenPrice(e.target.value)}
              />
            </div>
            <div>
              <span>Expire days</span>
              <Input
                value={expireDays}
                type="number"
                onChange={(e) => handleUserInputExpireDays(e.target.value)}
              />
            </div>
            <div>
              <span className="flex items-center gap-4">
                <span className="text-sm font-medium">Selected items</span>{' '}
                <Tootltip>Selected items will be used to fulfill this order</Tootltip>
              </span>
              <div className="flex gap-2">
                <Input disabled type="text" value={acceptAny ? '-' : selectedTokens.length} />
                {selectedTokens.length > 0 && !acceptAny && (
                  <Button onClick={() => setSelectedTokens([])}>Clear</Button>
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
                setFilteredTokens={setFilteredTokens}
                onAttributeSelect={() => setTokensPage(0)}
              ></ItemsNavigation>
              <div className="flex h-8 gap-4 items-center justify-between">
                <div>{filteredTokens.length} Results</div>
                <Button
                  onClick={() => {
                    setSelectedTokens(Array.from(new Set([...filteredTokens, ...selectedTokens])));
                  }}
                >
                  Select all
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                {paginatedTokens.map((token) => (
                  <CardNFTSelectable
                    key={token.tokenId}
                    tokenId={Number(token.tokenId)}
                    src={token.image}
                    onSelect={() => handleSelectToken(token)}
                    selected={selectedTokens.includes(token)}
                  />
                ))}
              </div>
              <Paginator
                items={filteredTokens}
                page={tokensPage}
                setItems={setPaginatedTokens}
                setPage={setTokensPage}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          )}
        </div>
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 text-sm bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={token.image} />
            <div className="text-center text-base leading-8">{`${collection?.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You receive</div>
            {ethPrice && <TextBox>{`${ethPrice} ETH`}</TextBox>}
            <TextBox>
              <span className="flex justify-between">
                <span className="flex-grow">{`${tokenPrice} ${collection?.symbol}`}</span>
                <span className="font-sans text-zinc-400">
                  {acceptAny ? 'any' : `${selectedTokens.length} selected`}
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
            <a className="default mx-8" onClick={() => navigate(`/c/${collection?.contract}`)}>
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
  setFilteredTokens: Function;
}) {
  const { data: collection } = useContext(CollectionContext);
  const [showAttributes, setShowAttributes] = useState(false);

  const { data: filteredTokenIds } = useQuery<{
    data?: { tokens: Token[]; count: number; limit?: number; skip?: number };
    error?: string;
  }>({
    queryKey: ['tokens', props.filteredAttributes],
    enabled: !!collection,
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection?.contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: props.filteredAttributes }, null, 0),
      }).then((res) => res.json()),
  });

  const tokens = filteredTokenIds?.data?.tokens ?? [];
  useEffect(() => props.setFilteredTokens(tokens), [tokens.map((t) => t.tokenId).join('-')]);

  if (!collection) {
    return <></>;
  }

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
          {Object.entries(collection.attributeSummary).map(([key, value]) => (
            <div key={key}>
              <div className="flex flex-col gap-2 pb-4 relative">
                <div className="sticky left-0 top-0 pb-2 bg-zinc-800">{value.attribute}</div>
                {Object.entries(value.options).map(([optionKey, optionValue]) => (
                  <Checkbox
                    key={optionKey}
                    label={optionValue}
                    checked={props.filteredAttributes[key] === optionKey}
                    onClick={() => {
                      if (props.filteredAttributes[key] === optionKey) {
                        const selectedFiltersCopy = { ...props.filteredAttributes };
                        delete selectedFiltersCopy[key];
                        props.setFilteredAttributes(selectedFiltersCopy);
                        props.onAttributeSelect?.();
                      } else {
                        props.setFilteredAttributes({
                          ...props.filteredAttributes,
                          [key]: optionKey,
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
  const { data: collection } = useContext(CollectionContext);

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {Object.keys(props.filteredAttributes).map((key) => (
        <TagLight
          key={`${key}-${props.filteredAttributes[key]}`}
          onClick={() => {
            const filteredAttributesCopy = { ...props.filteredAttributes };
            delete filteredAttributesCopy[key];
            props.setFilteredAttributes(filteredAttributesCopy);
            props.onAttributeSelect?.();
          }}
        >
          {`${collection?.attributeSummary[key].attribute}: ${
            collection?.attributeSummary[key].options[props.filteredAttributes[key]]
          }`}
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
