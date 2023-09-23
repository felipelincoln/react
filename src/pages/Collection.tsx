import { useLoaderData } from 'react-router-dom';

export default function Collection() {
  const { collectionName } = useLoaderData();
  return <h1>Collection {collectionName} </h1>;
}
