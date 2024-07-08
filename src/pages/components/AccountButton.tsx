import { useAccount, useConnect, useEnsName } from 'wagmi';
import { shortAddress } from '../../utils';
import { config } from '../../config';
import { injected } from 'wagmi/connectors';
import { Button } from './Button';

export function AccountButton({ onClick }: { onClick: () => void }) {
  const { connect } = useConnect();
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });

  if (!window.ethereum) {
    return (
      <div>
        <Button disabled>No wallet detected</Button>
      </div>
    );
  }

  if (ensName) {
    return (
      <Button onClick={onClick}>
        <span>{ensName}</span>
      </Button>
    );
  }

  if (address) {
    return (
      <Button onClick={onClick}>
        <span>{shortAddress(address)}</span>
      </Button>
    );
  }

  const chainId = config.web3.chain.id;

  return <Button onClick={() => connect({ connector: injected(), chainId })}>Connect</Button>;
}
