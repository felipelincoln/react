import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

interface CollectionLoaderData {
  collectionName: string;
}

export function loader({ params }: LoaderFunctionArgs): CollectionLoaderData {
  return { collectionName: params.collectionName! };
}

export default function CollectionPage() {
  const { collectionName } = useLoaderData() as CollectionLoaderData;
  return (
    <div className="bg-white dark:bg-black text-black dark:text-white">
      <h1>Collection {collectionName} </h1>
    </div>
  );
}
