import moment from 'moment';
import { ExternalLink, ItemEth, ItemNft } from '.';
import { Activity } from '../../api/types';
import { shortAddress } from '../../utils';
import { config } from '../../config';

export function ActivityTableRow({
  activity,
  tokenImages,
  userAddress,
}: {
  activity: Activity;
  tokenImages: Record<string, string>;
  userAddress?: string;
}) {
  return (
    <tr className="border-b-2 border-zinc-800 *:py-4 last:border-0">
      <td className="align-top pr-8">
        <ItemNft src={tokenImages[activity.tokenId]} tokenId={activity.tokenId}></ItemNft>
      </td>
      <td className="pr-8">
        <div className="flex flex-col gap-2">
          {activity.fulfillment.coin && <ItemEth value={activity.fulfillment.coin.amount} />}
          {activity.fulfillment.token.identifier.map((tokenId) => (
            <ItemNft key={activity.txHash + tokenId} src={tokenImages[tokenId]} tokenId={tokenId} />
          ))}
        </div>
      </td>
      <td className="text-xs align-top pr-8">
        {activity.offerer == (userAddress || '').toLowerCase()
          ? 'You'
          : shortAddress(activity.offerer)}
      </td>
      <td className="text-xs align-top pr-8">
        {activity.fulfiller == (userAddress || '').toLowerCase()
          ? 'You'
          : shortAddress(activity.fulfiller)}
      </td>
      <td className="text-xs align-top">
        <ExternalLink href={`${config.eth.chain.blockExplorers.default.url}/tx/${activity.txHash}`}>
          {moment(activity.createdAt * 1000).fromNow()}
        </ExternalLink>
      </td>
    </tr>
  );
}
