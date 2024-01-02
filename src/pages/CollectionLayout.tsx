import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import collections, { CollectionDetails } from '../collections';
import NotFoundPage from './NotFound';
import { ReactElement, createContext, useContext } from 'react';

export const CollectionContext = createContext<CollectionDetails>('');

export function collectionLoader({ params }: LoaderFunctionArgs) {
  const collectionSlug = params.collectionName!;
  const collection = collections[collectionSlug];

  return { collection };
}

export default function CollectionLayout({ children }: { children: ReactElement }) {
  const { collection } = useLoaderData() as { collection: CollectionDetails | undefined };

  if (!collection) {
    return <NotFoundPage></NotFoundPage>;
  }

  return <CollectionContext.Provider value={collection}>{children}</CollectionContext.Provider>;
}

export function TestPage() {
  const collection = useContext(CollectionContext);
  return <>{collection.name}</>;
}
