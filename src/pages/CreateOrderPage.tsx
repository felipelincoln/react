import { LoaderFunctionArgs } from 'react-router-dom';
import { collectionLoader } from './App';

export function createOrderLoader(loaderArgs: LoaderFunctionArgs) {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

export function CreateOrderPage() {
  return <p>Create Order</p>;
}
