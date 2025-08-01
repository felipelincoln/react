import { Order } from '../api/types';

export function userCanFulfillOrder(
  order: Order,
  userTokenIds: number[],
  userBalance: bigint,
  userAddress: string,
) {
  const tokensCriteria = order.fulfillmentCriteria.token;
  const coinsCriteria = BigInt(order.fulfillmentCriteria.coin?.amount ?? '0');
  const userCoins = userBalance;

  if (userAddress.toLowerCase() === order.offerer) {
    return false;
  }

  if (userCoins < coinsCriteria) {
    return false;
  }

  if (userTokenIds.length < Number(tokensCriteria.amount)) {
    return false;
  }

  let userTokensInOrderCriteria = 0;
  userTokenIds.forEach((tokenId) => {
    tokensCriteria.identifier.includes(tokenId) && userTokensInOrderCriteria++;
  });

  if (userTokensInOrderCriteria < Number(tokensCriteria.amount)) {
    return false;
  }

  return true;
}
