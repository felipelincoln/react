import { config } from '../config';
import { Activity, ApiResponse, Collection, Notification, Order } from './types';
import { handleFetchError } from './utils';

export function fetchCollection(contract: string) {
  return {
    queryKey: ['collection', contract],
    queryFn: async (): Promise<
      ApiResponse<{
        collection: Collection;
        isReady: boolean;
        tokenImages?: Record<string, string>;
      }>
    > => {
      console.log('> [api] fetch collection');
      return fetch(`${config.api.url}/collections/get/${contract}`).then(handleFetchError);
    },
  };
}

// deprecated
export function fetchCollectionList(query?: { limit?: number }) {
  let fetchQuery: string | undefined = undefined;

  if (query?.limit) {
    fetchQuery = new URLSearchParams({ limit: query.limit.toString() }).toString();
  }

  return {
    queryKey: ['collectionList'],
    queryFn: async (): Promise<
      ApiResponse<{
        collections: Collection[];
      }>
    > => {
      console.log('> [api] fetch collection list');
      return fetch(`${config.api.url}/collections/list?${fetchQuery ?? ''}`).then(handleFetchError);
    },
  };
}

export function fetchCollectionTrending() {
  return {
    queryKey: ['collectionTrending'],
    queryFn: async (): Promise<
      ApiResponse<{
        trending: {
          collection: Collection;
          floor_price?: { coin_amount?: bigint; token_amount: number };
          listings: number;
          trades: number;
        }[];
      }>
    > => {
      console.log('> [api] fetch collection trending');
      return fetch(`${config.api.url}/collections/trending`).then(handleFetchError);
    },
  };
}

export function fetchTokenIds(contract: string, filter: Record<string, string>) {
  return {
    queryKey: ['tokenIds', contract, filter],
    queryFn: async (): Promise<
      ApiResponse<{
        tokens: number[];
        count: number;
        skip?: number;
        limit?: number;
      }>
    > => {
      console.log('> [api] fetch token ids');
      return fetch(`${config.api.url}/tokens/list/${contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filter }, null, 0),
      }).then(handleFetchError);
    },
  };
}

export function fetchOrders(contract: string, tokenIds: number[]) {
  const contractLowerCase = contract.toLowerCase();
  return {
    queryKey: ['orders', contractLowerCase, tokenIds.join(',')],
    queryFn: async (): Promise<ApiResponse<{ orders: Order[] }>> => {
      console.log('> [api] fetch orders');
      return fetch(`${config.api.url}/orders/list/${contractLowerCase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds }, null, 0),
      }).then(handleFetchError);
    },
  };
}

export function fetchUserTokenIds(contract: string, address: string) {
  return {
    queryKey: ['userTokenIds', contract, address],
    queryFn: async (): Promise<ApiResponse<{ tokenIds: number[] }>> => {
      console.log('> [api] fetch user token ids');
      return fetch(`${config.api.url}/eth/tokens/list/${contract}/${address}`).then(
        handleFetchError,
      );
    },
  };
}

export function fetchActivities(contract: string, tokenIds: number[]) {
  return {
    queryKey: ['activities', contract, tokenIds.join('-')],
    queryFn: async (): Promise<ApiResponse<{ activities: Activity[] }>> => {
      console.log('> [api] fetch activities');
      return fetch(`${config.api.url}/activities/list/${contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds }, null, 0),
      }).then(handleFetchError);
    },
  };
}

export function fetchUserNotifications(contract: string, address: string) {
  return {
    queryKey: ['userNotifications', contract, address],
    queryFn: async (): Promise<ApiResponse<{ notifications: Notification[] }>> => {
      console.log('> [api] fetch user notifications');
      return fetch(`${config.api.url}/notifications/list/${contract}/${address}`).then(
        handleFetchError,
      );
    },
  };
}

export function fetchUserActivities(contract: string, address: string) {
  return {
    queryKey: ['userActivities', contract, address],
    queryFn: async (): Promise<ApiResponse<{ activities: Activity[] }>> => {
      console.log('> [api] fetch user activities');
      return fetch(`${config.api.url}/activities/list/${contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }, null, 0),
      }).then(handleFetchError);
    },
  };
}

export function fetchUserOrders(contract: string, address: string) {
  return {
    queryKey: ['userOrders', contract, address],
    queryFn: async (): Promise<ApiResponse<{ orders: Order[] }>> => {
      console.log('> [api] fetch user orders');
      return fetch(`${config.api.url}/orders/list/${contract}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offerer: address }, null, 0),
      }).then(handleFetchError);
    },
  };
}
