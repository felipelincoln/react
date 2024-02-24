import MerkleTree from 'merkletreejs';
import { keccak256, toHex } from 'viem';
import seaportABIJson from './contractAbi/seaport.abi.json';
import { config } from '../../config';

export interface Order {
  token: string;
  tokenId: string;
  offerer: string;
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
}

export type WithSignature<T> = T & { signature: string };
export type WithSelectedTokenIds<T> = T & { selectedTokenIds: string[] };

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

function seaportEIP712Domain() {
  return {
    name: 'Seaport',
    version: '1.5',
    chainId: Number(config.ethereumNetwork),
    verifyingContract: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc' as `0x${string}`,
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

function seaportEIP712Message(args: Order) {
  const ethConsideration = args.fulfillmentCriteria.coin && {
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

  let ethConsiderationList = !!ethConsideration ? [ethConsideration] : [];
  let tokenConsiderationList = Array.from(
    { length: Number(args.fulfillmentCriteria.token.amount) },
    () => tokenConsideration,
  );

  return {
    offerer: args.offerer,
    zone: '0x0000000000000000000000000000000000000000',
    offer: [
      {
        itemType: '2',
        token: args.token,
        identifierOrCriteria: args.tokenId,
        startAmount: '1',
        endAmount: '1',
      },
    ],
    consideration: [...ethConsiderationList, ...tokenConsiderationList],
    orderType: '0',
    startTime: '1700000000',
    endTime: args.endTime,
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '1000000001',
    conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
    counter: '0',
  };
}

function seaportFulfillAdvancedOrderArgs(order: WithSelectedTokenIds<WithSignature<Order>>) {
  const offer = [['2', order.token, order.tokenId, 1, 1]]; // itemType, token, identifierOrCriteria, startAmount, endAmount

  const fulfillAdvancedOrderMessage = seaportEIP712Message(order);
  //const offer = fulfillAdvancedOrderMessage.offer.map((obj) => Object.values(obj));;
  const consideration = fulfillAdvancedOrderMessage.consideration.map((obj) => Object.values(obj));

  const orderParameters = [
    order.offerer,
    '0x0000000000000000000000000000000000000000', // zone,
    offer,
    consideration,
    '0', // order type
    '1700000000', // startTime
    order.endTime,
    '0x0000000000000000000000000000000000000000000000000000000000000000', // zoneHash
    '1000000001', // salt
    '0x0000000000000000000000000000000000000000000000000000000000000000', // conduitKey
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

  console.log({ consideration, criteriaResolvers });

  return [
    advancedOrder,
    criteriaResolvers,
    '0x0000000000000000000000000000000000000000000000000000000000000000', // conduitKey
    '0x0000000000000000000000000000000000000000', // recipientAddress (TODO: what is this?)
  ];
}

function seaportABI() {
  return seaportABIJson;
}

function seaportContractAddress() {
  return '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC';
}

export function marketplaceProtocolEIP712Default() {
  return {
    domain: seaportEIP712Domain(),
    primaryType: 'OrderComponents' as 'OrderComponents',
    types: seaportEIP712Types(),
  };
}

export function marketplaceProtocolEIP712Message(args: Order) {
  return seaportEIP712Message(args);
}

export function marketplaceProtocolFulfillOrderArgs(
  args: WithSelectedTokenIds<WithSignature<Order>>,
) {
  return seaportFulfillAdvancedOrderArgs(args);
}

export function marketplaceProtocolABI() {
  return seaportABI();
}

export function marketplaceProtocolContractAddress() {
  return seaportContractAddress() as `0x${string}`;
}
