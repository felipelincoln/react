import MerkleTree from 'merkletreejs';
import { keccak256, toHex } from 'viem';

export interface TypedMessage {
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

function seaportEIP712Domain() {
  return {
    name: 'Seaport',
    version: '1.5',
    chainId: 1,
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

function merkleTree(data: string[]) {
  const leaves = data.map((x) => toHex(Number(x), { size: 32 })).map((x) => keccak256(x));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const root = tree.getHexRoot();
  const proof = (leaf: string) => {
    return tree.getProof(leaf).map((x) => toHex(x.data));
  };

  return { root, proof };
}

function seaportEIP712Message(args: TypedMessage) {
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
    consideration: [
      ...[
        args.fulfillmentCriteria.coin && {
          itemType: '0',
          token: '0x0000000000000000000000000000000000000000',
          identifierOrCriteria: '0',
          startAmount: args.fulfillmentCriteria.coin.amount,
          endAmount: args.fulfillmentCriteria.coin.amount,
          recipient: args.offerer,
        },
      ].filter(Boolean),
      {
        itemType: '4',
        token: args.token,
        identifierOrCriteria: merkleTree(args.fulfillmentCriteria.token.identifier).root,
        startAmount: args.fulfillmentCriteria.token.amount,
        endAmount: args.fulfillmentCriteria.token.amount,
        recipient: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      },
    ],
    orderType: '0',
    startTime: '1700000000',
    endTime: args.endTime,
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '1000000001',
    conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
    counter: '0',
  };
}

export function marketplaceProtocolEIP712Default() {
  return {
    domain: seaportEIP712Domain(),
    primaryType: 'OrderComponents' as 'OrderComponents',
    types: seaportEIP712Types(),
  };
}

export function marketplaceProtocolEIP712Message(args: TypedMessage) {
  return seaportEIP712Message(args);
}
