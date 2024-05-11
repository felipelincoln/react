import { config } from '../config';
import { Order } from './types';
import { handleFetchError } from './utils';

export function postOrder(order: Order) {
  return {
    mutationFn: async () => {
      console.log('> [api] post order');
      return fetch(`${config.api.url}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order }, null, 0),
      }).then(handleFetchError);
    },
  };
}

export function postViewUserNotifications(notificationIds: string[]) {
  return {
    mutationFn: async () => {
      console.log('> [api] post view user notifications');
      return fetch(`${config.api.url}/notifications/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }, null, 0),
      }).then(handleFetchError);
    },
  };
}
