import raccoolsAbi from '../collection/abi/raccools.abi.json';
import raccoolsSepoliaAbi from '../collection/abi/raccools-sepolia.abi.json';
import raccoolsAttributes from '../collection/attributes/raccools.json';
import raccoolsSepoliaAttributes from '../collection/attributes/raccools-sepolia.json';
import { Abi } from 'viem';
import { EthereumNetwork, config } from '../config';

function range(start: number, end: number) {
  return Array.from({ length: end }, (_, index) => String(index + start));
}

export interface CollectionDetails {
  key: string;
  name: string;
  symbol: string;
  address: `0x${string}`;
  abi: Abi;
  mintedTokens: string[];
  attributes: { [tokenId: string]: string[] };
}

const mainnetSupportedCollections = {
  ['raccools']: {
    key: 'raccools',
    name: 'Raccools',
    symbol: 'RACCOOL',
    abi: raccoolsAbi,
    address: '0x1dDB32a082c369834b57473Dd3a5146870ECF8B7',
    mintedTokens: range(1, 6969),
    attributes: raccoolsAttributes,
  },
} as { [slug: string]: CollectionDetails };

const sepoliaSupportedCollections = {
  ['sep-raccools']: {
    key: 'sep-raccools',
    name: 'SepRaccools',
    symbol: 'SEPRACCOOL',
    abi: raccoolsSepoliaAbi,
    address: '0x9ba6eba1fe9aa92feb36161009108dcee4ec64f2',
    mintedTokens: range(1, 100),
    attributes: raccoolsSepoliaAttributes,
  },
} as { [slug: string]: CollectionDetails };

export const supportedCollections = (() => {
  switch (config.ethereumNetwork) {
    case EthereumNetwork.Mainnet:
      return mainnetSupportedCollections;
    case EthereumNetwork.Sepolia:
      return sepoliaSupportedCollections;
    default:
      return {};
  }
})();

export const defaultCollection = supportedCollections['raccools'];
