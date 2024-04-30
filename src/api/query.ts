import { config } from '../config';
import { Collection } from './types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export function fetchCollection(contract: string) {
  return {
    queryKey: ['collection'],
    queryFn: async (): Promise<ApiResponse<{ collection: Collection; isReady: boolean }>> => {
      console.log('> [api] calling fetch collection');
      return fetch(`${config.api.url}/collections/get/${contract}`).then(handleFetchError);
    },
  };
}

async function handleFetchError(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}
