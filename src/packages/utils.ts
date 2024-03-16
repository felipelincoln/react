import { formatEther } from 'viem';

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
