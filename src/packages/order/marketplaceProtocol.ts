import MerkleTree from 'merkletreejs';
import { keccak256, toHex } from 'viem';
import seaportABIJson from './contractAbi/seaport.abi.json';
import { config } from '../../config';
import { OrderCreate } from '../../pages/OrderCreate';

export interface Order {
  token: string;
  tokenId: string;
  offerer: string;
  fee?: {
    recipient: string;
    amount: string;
  };
  fulfillmentCriteria: {
    coin?: {
      amount: string;
    };
    token: {
      amount: string;
      identifier: string[];
    };
  };
  endTime: string;
  salt: string;
}

export type With_Id<t> = t & { _id: string };
export type WithSignature<T> = T & { signature: string };
export type WithSelectedTokenIds<T> = T & { selectedTokenIds: string[] };
export type WithCounter<T> = T & { counter: string };

export interface Activity {
  etype: string;
  token: string;
  tokenId: string;
  offerer: string;
  fulfiller: string;
  fulfillment: {
    coin?: {
      amount: string;
    };
    token: {
      amount: string;
      identifier: string[];
    };
  };
  txHash: string;
  createdAt: string;
}

export interface Notification {
  activityId: string;
  address: string;
}

function merkleTree(data: string[]) {
  const leaves = data.map((x) => toHex(Number(x), { size: 32 })).map((x) => keccak256(x));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();
  const proof = (leaf: string) => {
    const leafHash = keccak256(toHex(Number(leaf), { size: 32 }));
    return tree.getProof(leafHash).map((x) => toHex(x.data));
  };

  return { root, proof };
}

function seaport() {
  return {
    name: 'Seaport',
    version: '1.5',
    contract: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc' as `0x${string}`,
    zone: '0x0000000000000000000000000000000000000000',
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
    startTime: '0',
  };
}

function seaportEIP712Domain() {
  return {
    name: seaport().name,
    version: seaport().version,
    chainId: Number(config.ethereumNetwork),
    verifyingContract: seaport().contract,
  };
}

function seaportEIP712Types() {
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

function seaportEIP712Message(args: WithCounter<Order>) {
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
    token: args.token,
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

  const ethConsiderationList = !!ethConsideration ? [ethConsideration] : [];
  const feeConsiderationList = !!marketplaceFeeConsideration ? [marketplaceFeeConsideration] : [];
  const tokenConsiderationList = Array.from(
    { length: Number(args.fulfillmentCriteria.token.amount) },
    () => tokenConsideration,
  );

  return {
    offerer: args.offerer,
    zone: seaport().zone,
    offer: [
      {
        itemType: '2',
        token: args.token,
        identifierOrCriteria: args.tokenId,
        startAmount: '1',
        endAmount: '1',
      },
    ],
    consideration: [...ethConsiderationList, ...feeConsiderationList, ...tokenConsiderationList],
    orderType: '0',
    startTime: seaport().startTime,
    endTime: args.endTime,
    zoneHash: seaport().zoneHash,
    salt: args.salt,
    conduitKey: seaport().conduitKey,
    counter: args.counter,
  };
}

function seaportFulfillAdvancedOrderArgs(order: WithSelectedTokenIds<WithSignature<Order>>) {
  const offer = [['2', order.token, order.tokenId, 1, 1]]; // itemType, token, identifierOrCriteria, startAmount, endAmount

  const fulfillAdvancedOrderMessage = seaportEIP712Message({ ...order, counter: '' });
  const consideration = fulfillAdvancedOrderMessage.consideration.map((obj) => Object.values(obj));

  const orderParameters = [
    order.offerer,
    seaport().zone, // zone,
    offer,
    consideration,
    '0', // order type
    seaport().startTime, // startTime
    order.endTime,
    seaport().zoneHash, // zoneHash
    order.salt, // salt
    seaport().conduitKey, // conduitKey
    consideration.length,
  ];

  const advancedOrder = [orderParameters, 1, 1, order.signature, '0x'];

  const hasEthConsideration = !!order.fulfillmentCriteria.coin;

  const criteriaResolvers = order.selectedTokenIds.map((tokenId, itemIndex) => {
    return [
      0, // order index
      1, // side (offer | consideration)
      itemIndex + Number(hasEthConsideration), // item index
      tokenId,
      merkleTree(order.fulfillmentCriteria.token.identifier).proof(tokenId),
    ];
  });

  return [
    advancedOrder,
    criteriaResolvers,
    seaport().conduitKey, // conduitKey
    '0x0000000000000000000000000000000000000000', // recipientAddress (TODO: what is this?)
  ];
}

function seaportCancelOrderArgs(order: WithCounter<Order>) {
  const advancedOrder = seaportFulfillAdvancedOrderArgs({
    ...order,
    selectedTokenIds: [],
    signature: '',
  })[0][0] as any[];

  advancedOrder[10] = [order.counter];

  return [[advancedOrder]];
}

function seaportABI() {
  return seaportABIJson;
}

function seaportContractAddress() {
  return seaport().contract;
}

export function marketplaceProtocolEIP712Default() {
  return {
    domain: seaportEIP712Domain(),
    primaryType: 'OrderComponents' as 'OrderComponents',
    types: seaportEIP712Types(),
  };
}

export function marketplaceProtocolEIP712Message(args: WithCounter<Order>) {
  return seaportEIP712Message(args);
}

export function marketplaceProtocolFulfillOrderArgs(
  args: WithSelectedTokenIds<WithSignature<Order>>,
) {
  return seaportFulfillAdvancedOrderArgs(args);
}

export function marketplaceProtocolCancelOrderArgs(args: WithCounter<Order>) {
  return seaportCancelOrderArgs(args);
}

export function marketplaceProtocolABI() {
  return seaportABI();
}

export function marketplaceProtocolContractAddress() {
  return seaportContractAddress() as `0x${string}`;
}
