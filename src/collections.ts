import raccoolsAbi from './abi/raccools.abi.json';
import { Abi } from "viem";

export interface CollectionDetails {
  key: string;
  name: string;
  symbol: string;
  address: `0x${string}`;
  abi: Abi;
}

export const supportedCollections = {
  ['raccools']: {
    key: 'raccools',
    name: 'Raccools',
    symbol: 'RACCOOL',
    abi: raccoolsAbi,
    address: '0x1dDB32a082c369834b57473Dd3a5146870ECF8B7',
  },
} as { [slug: string]: CollectionDetails };

export const defaultCollection = supportedCollections['raccools'];
