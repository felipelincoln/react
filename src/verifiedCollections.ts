import verifiedCollectionsRaw from './verifiedCollections.json';
import { config } from './config';

interface VerifiedCollection {
  royalty: {
    recipient: string;
    amount: string;
  };
}

const chain = config.chain;
const verifiedCollectionsJson = verifiedCollectionsRaw as Record<
  string,
  Record<string, VerifiedCollection | undefined> | undefined
>;
export const verifiedCollections = verifiedCollectionsJson[chain] || {};
