import MerkleTree from 'merkletreejs';
import { keccak256, toHex } from 'viem';
import seaportAbiJson from './seaport.abi.json';
import { config } from '../config';
import { Order } from '../api/types';

export type OrderFragment = Omit<Order, 'signature' | 'orderHash'>;
export type WithCounter<T> = T & { counter: string };
type WithSignature<T> = T & { signature: string };
export type WithSelectedTokenIds<T> = T & { selectedTokenIds: number[] };

function merkleTree(data: number[]) {
  const leaves = data.map((x) => toHex(x, { size: 32 })).map((x) => keccak256(x));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();
  const proof = (leaf: number) => {
    const leafHash = keccak256(toHex(leaf, { size: 32 }));
    return tree.getProof(leafHash).map((x) => toHex(x.data));
  };

  return { root, proof };
}

const seaport = config.web3.seaport;

function seaportEip712Domain() {
  return {
    name: seaport.name,
    version: seaport.version,
    chainId: config.web3.chain.id,
    verifyingContract: seaport.contract,
  };
}

function seaportEip712Types() {
  return {
    OrderComponents: [
      { name: 'offerer', type: 'address' },
      { name: 'zone', type: 'address' },
      { name: 'offer', type: 'OfferItem[]' },
      { name: 'consideration', type: 'ConsiderationItem[]' },
      { name: 'orderType', type: 'uint8' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'zoneHash', type: 'bytes32' },
      { name: 'salt', type: 'uint256' },
      { name: 'conduitKey', type: 'bytes32' },
      { name: 'counter', type: 'uint256' },
    ],
    OfferItem: [
      { name: 'itemType', type: 'uint8' },
      { name: 'token', type: 'address' },
      { name: 'identifierOrCriteria', type: 'uint256' },
      { name: 'startAmount', type: 'uint256' },
      { name: 'endAmount', type: 'uint256' },
    ],
    ConsiderationItem: [
      { name: 'itemType', type: 'uint8' },
      { name: 'token', type: 'address' },
      { name: 'identifierOrCriteria', type: 'uint256' },
      { name: 'startAmount', type: 'uint256' },
      { name: 'endAmount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
  };
}

export function seaportEip712Message(args: WithCounter<OrderFragment>) {
  const ethConsideration = !!args.fulfillmentCriteria.coin && {
    itemType: '0',
    token: '0x0000000000000000000000000000000000000000',
    identifierOrCriteria: '0',
    startAmount: args.fulfillmentCriteria.coin.amount,
    endAmount: args.fulfillmentCriteria.coin.amount,
    recipient: args.offerer,
  };

  const tokenConsideration = {
    itemType: '4',
    token: args.contract,
    identifierOrCriteria: merkleTree(args.fulfillmentCriteria.token.identifier).root,
    startAmount: '1',
    endAmount: '1',
    recipient: args.offerer,
  };

  const marketplaceFeeConsideration = !!args.fee && {
    itemType: '0',
    token: '0x0000000000000000000000000000000000000000',
    identifierOrCriteria: '0',
    startAmount: args.fee.amount,
    endAmount: args.fee.amount,
    recipient: args.fee.recipient,
  };

  const ethConsiderationList = ethConsideration ? [ethConsideration] : [];
  const feeConsiderationList = marketplaceFeeConsideration ? [marketplaceFeeConsideration] : [];
  const tokenConsiderationList = Array.from(
    { length: Number(args.fulfillmentCriteria.token.amount) },
    () => tokenConsideration,
  );

  return {
    offerer: args.offerer,
    zone: seaport.zone,
    offer: [
      {
        itemType: '2',
        token: args.contract,
        identifierOrCriteria: args.tokenId,
        startAmount: '1',
        endAmount: '1',
      },
    ],
    consideration: [...ethConsiderationList, ...feeConsiderationList, ...tokenConsiderationList],
    orderType: '0',
    startTime: seaport.startTime,
    endTime: args.endTime,
    zoneHash: seaport.zoneHash,
    salt: args.salt,
    conduitKey: seaport.conduitKey,
    counter: args.counter,
  };
}

export function seaportFulfillAdvancedOrderArgs(
  order: WithSelectedTokenIds<WithSignature<OrderFragment>>,
) {
  const offer = [['2', order.contract, order.tokenId, 1, 1]]; // itemType, token, identifierOrCriteria, startAmount, endAmount

  const fulfillAdvancedOrderMessage = seaportEip712Message({
    ...order,
    counter: '',
  });
  const consideration = fulfillAdvancedOrderMessage.consideration.map((obj) => Object.values(obj));

  const orderParameters = [
    order.offerer,
    seaport.zone,
    offer,
    consideration,
    '0', // order type
    seaport.startTime,
    order.endTime,
    seaport.zoneHash,
    order.salt,
    seaport.conduitKey,
    consideration.length,
  ];

  const advancedOrder = [orderParameters, 1, 1, order.signature, '0x'];

  const hasEthConsideration = !!order.fulfillmentCriteria.coin;
  const hasFeeCondition = !!order.fee;

  const criteriaResolvers = order.selectedTokenIds.map((tokenId, itemIndex) => {
    return [
      0, // order index
      1, // side (offer | consideration)
      itemIndex + Number(hasEthConsideration) + Number(hasFeeCondition), // item index
      tokenId,
      merkleTree(order.fulfillmentCriteria.token.identifier).proof(tokenId),
    ];
  });

  return [
    advancedOrder,
    criteriaResolvers,
    seaport.conduitKey,
    '0x0000000000000000000000000000000000000000', // recipientAddress
  ];
}

export function seaportCancelOrderArgs(order: WithCounter<OrderFragment>) {
  const advancedOrder = seaportFulfillAdvancedOrderArgs({
    ...order,
    selectedTokenIds: [],
    signature: '',
  })[0][0] as (string | number | (string | number)[][] | string[])[]; // order.advancedOrder.orderParameters

  advancedOrder[10] = [order.counter];

  return [[advancedOrder]];
}

export function seaportAbi() {
  return seaportAbiJson;
}

export function seaportContractAddress() {
  return seaport.contract;
}

export function seaportEip712Default() {
  return {
    domain: seaportEip712Domain(),
    primaryType: 'OrderComponents' as const,
    types: seaportEip712Types(),
  };
}
