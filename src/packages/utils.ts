import { formatEther } from 'viem';
import { Order } from './order/marketplaceProtocol';
import { UserTokenIdsContext } from '../pages/App';

interface FulfillmentCriteria {
  coin?: {
    amount: string;
  };
  token: {
    amount: string;
    identifier: string[];
  };
}

export function etherToString(ether = 0n, truncate = true) {
  let formatted = formatEther(ether);

  if (!truncate) {
    return formatted.concat(' ETH');
  }

  let indexOfSeparator = formatted.indexOf('.');
  if (indexOfSeparator != -1) {
    formatted = formatted.slice(0, indexOfSeparator + 5);
    if (formatted === '0.0000') {
      return '< 0.0001 ETH';
    }
  }
  return formatted.concat(' ETH');
}

export function shortAddress(address: string): string {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function userCanFulfillOrder(
  order: Order,
  userTokenIds: string[] | undefined,
  userBalance: string | undefined,
  userAddress: string | undefined,
) {
  const tokensCriteria = order.fulfillmentCriteria.token;
  const coinsCriteria = BigInt(order.fulfillmentCriteria.coin?.amount ?? '0');
  const userTokens = userTokenIds || [];
  const userCoins = BigInt(userBalance || '0');

  if (userAddress === order.offerer) {
    return false;
  }

  if (userCoins < coinsCriteria) {
    return false;
  }

  if (userTokens.length < Number(tokensCriteria.amount)) {
    return false;
  }

  let userTokensInOrderCriteria = 0;
  userTokens.forEach((token) => {
    tokensCriteria.identifier.includes(token) && userTokensInOrderCriteria++;
  });

  if (userTokensInOrderCriteria < Number(tokensCriteria.amount)) {
    return false;
  }

  return true;
}
