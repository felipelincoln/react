import { LoaderFunctionArgs, useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import { formatEther } from 'viem';

const thumbnails: { [tokenId: string]: string } = {
  '1': 'https://i.seadn.io/gae/n_y_mSubigoNRB7pP1rtvsWr-kPkpkLC30N5BsTx0hgVwC5hxfezolosaEARqkGAR5p_toPVoqIoUJf2TnAjtKauyr39nqGY84k3-w?auto=format&dpr=1&w=1000',
  '2': 'https://i.seadn.io/gae/SdD-DnIBYFzJMbfiXlzms2zrkfKe0wsr1w5JeCmJ1SvidFuaHFflM4q_5nai2ULbG5tVD7gTCpcqiwo08Pe0GcZCuNu9rMVIY-B4QQ?auto=format&dpr=1&w=1000',
  '3': 'https://i.seadn.io/gae/bBUIGlgIMjCFrh-VskswcxV2vYavajJ5Rc87vyarUuyH-nY2uZ_y2ewe3-3j5gISUhIjqPZF-crB5e8s2frGJrkhWo8aIBX9Nu4ycQ?auto=format&dpr=1&w=1000',
  '4': 'https://i.seadn.io/gae/NBw-9I5A-kv4IrMULk8TdY_Sj1Kl6zOnrLGaYxxZlKI-1nlFPtxsDq7WlgOQlWMYrYKQ4JFtVw5hVa5Si708Yka7Oulq1VsivhJEJg?auto=format&dpr=1&w=1000',
  '5': 'https://i.seadn.io/gae/lLS27WH0ucap_qcUpw3BRfDVcm3FOR_UGSH69vzmGQo7krnvvHkTV0578P8m5P_c98n7k0Vh2C-ZnII38FvtGngP41AvR3UQnRiDEg?auto=format&dpr=1&w=1000',
  '6': 'https://i.seadn.io/s/raw/files/56825e9179d781f23fc44267b0b50baa.png?auto=format&dpr=1&w=1000',
  '7': 'https://i.seadn.io/gae/KaBkEknEOIcheFfs4ovomwQoFBcTOu2QLaFg2jI5tJM7mA_RPj8LGAzg6M0oXkusR7HSWVeBgxFpY6--1nStDqZ1d3VXkJi6RqaK-uc?auto=format&dpr=1&w=1000',
  '8': 'https://i.seadn.io/gae/u8sJwnRTd8g3OS5b2uVZ9YGGoQh3Opl7PU7vDL5YOJyBss2HwQuYOQ0G4zxcA6agJ3QSf5u8NeJwBEcO7Zt_BnHWibDlfPSOsN3r?auto=format&dpr=1&w=1000',
  '9': 'https://i.seadn.io/gae/L5HuNMdETpuXQHNTNOAFFgrZNQflJGSyC4IRKSdzfAf8pn5KTCOxRhhMUd5_mr_VCsQ-McGwMBMKAyGOVcOKNafXYITdku9eNSc8?auto=format&dpr=1&w=1000',
  '10': 'https://i.seadn.io/gae/SFAtQy5vN8QLq-Lo6sXJaVtkVBZoOEJGB0ZpW57dM7hskcK3Ix0X3XXb3ezWA-89ui6m4VNPyqatKXmgdS1Lw734wdANhF3y0MKQmw?auto=format&dpr=1&w=1000',
};

const ids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

/* API MOCKING */
interface Event {
  id: string;
  etype: string;
  tokenId: string;
  offerer: string;
  fulfiller: string;
  fulfillment: {
    coin: {
      amount: string;
    };
    token: {
      amount: string;
      identifier: string[];
    };
  };
  txn_hash: string;
  block_hash: string;
  block_height: number;
  created_at: number;
}

interface EventsByAddressArgs {
  address?: string;
}

function eventsByAddress(args: EventsByAddressArgs): Event[] {
  let events: Event[] = [
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      etype: 'trade',
      tokenId: '1',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfiller: '0xD1688C4BfA1517502172CF0eD50306Ea1813e677',
      fulfillment: {
        coin: {
          amount: '100000000000000',
        },
        token: {
          amount: '1',
          identifier: ['4'],
        },
      },
      txn_hash: '0x13561845942024d611ee0301ae50e13a995dedc1deb1e0a7a432b0e96f204316',
      block_hash: '0x02e4cce342721d3ee7e4514cbedc0e0bca4b1ffcff9fe0a9cd2b992732840444',
      block_height: 18253479,
      created_at: 1696136343,
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3d',
      etype: 'trade',
      tokenId: '2',
      offerer: '0xD1688C4BfA1517502172CF0eD50306Ea1813e677',
      fulfiller: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillment: {
        coin: {
          amount: '0',
        },
        token: {
          amount: '1',
          identifier: ['7'],
        },
      },
      txn_hash: '0x13561845942024d611ee0301ae50e13a995dedc1deb1e0a7a432b0e96f204317',
      block_hash: '0x02e4cce342721d3ee7e4514cbedc0e0bca4b1ffcff9fe0a9cd2b992732840445',
      block_height: 18253480,
      created_at: 1696136360,
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3e',
      etype: 'trade',
      tokenId: '6',
      offerer: '0xD1688C4BfA1517502172CF0eD50306Ea1813e677',
      fulfiller: '0x5cc61632E181903cF2f476c420bF781F6ee53059',
      fulfillment: {
        coin: {
          amount: '1500000000000000',
        },
        token: {
          amount: '2',
          identifier: ['3', '4'],
        },
      },
      txn_hash: '0x13561845942024d611ee0301ae50e13a995dedc1deb1e0a7a432b0e96f204318',
      block_hash: '0x02e4cce342721d3ee7e4514cbedc0e0bca4b1ffcff9fe0a9cd2b992732840446',
      block_height: 18253481,
      created_at: 1696136380,
    },
  ];

  if (args.address) {
    events = events.filter(
      (event) => event.offerer == args.address || event.fulfiller == args.address,
    );
  }

  return events;
}

interface TokensOwnedByAddressArgs {
  address: string;
}

function tokensOwnedByAddress(_args: TokensOwnedByAddressArgs): string[] {
  return ['1', '2', '3'];
}

/* --- */

interface CollectionLoaderData {
  collectionName: string;
}

export function loader({ params }: LoaderFunctionArgs): CollectionLoaderData {
  return { collectionName: params.collectionName! };
}

interface GetActivityArgs {
  address?: string;
}

function getActivity(args: GetActivityArgs): Event[] {
  const events = eventsByAddress({ address: args.address });

  events.sort(({ block_height: a }, { block_height: b }) => b - a);

  return events;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function CollectionItemsPage() {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  const { collectionName } = useLoaderData() as CollectionLoaderData;

  const userAddress = '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D';
  const userTokenIds = tokensOwnedByAddress({ address: userAddress });
  const myItems = searchParams.get('myItems') == '1';

  let activity;

  if (myItems) {
    activity = getActivity({ address: userAddress });
  } else {
    activity = getActivity({});
  }

  const activityElements = activity.map((event) => {
    const date = new Date(event.created_at);

    return (
      <div key={event.id} className="bg-gray-900">
        <div className="flex">
          <div className="w-1/4">{event.etype}</div>
          <div className="w-1/4">{shortenAddress(event.offerer)}</div>
          <div className="w-1/4">{shortenAddress(event.fulfiller)}</div>
          <div className="w-1/4">{date.toDateString()}</div>
        </div>
      </div>
    );
  });

  return (
    <div>
      <div className="bg-gray-700 h-20">
        <div className="flex justify-between">
          <div>
            <div>Logo</div>
          </div>
          <div className="flex space-x-10">
            <div>{userTokenIds.length} RACCOOL</div>
            <div>0.013546 ETH</div>
            <div>mande.eth</div>
          </div>
        </div>
      </div>
      <div>
        <h1>Raccools</h1>
      </div>
      <div className="flex justify-between">
        <div className="flex space-x-10">
          <div onClick={() => navigate(`/collection/${collectionName}/items?myItems=${+myItems}`)}>
            Items
          </div>
          <div
            onClick={() => navigate(`/collection/${collectionName}/activity?myItems=${+myItems}`)}
          >
            Activity
          </div>
        </div>
        <div className="flex space-x-1" onClick={() => navigate(`?myItems=${+!myItems}`)}>
          <div>My Items</div>
          <input checked={myItems} onChange={() => {}} type="checkbox" />
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <div>{activity.length} Results</div>
        </div>
        <div>Attributes (0)</div>
      </div>
      <div className="flex flex-col">{activityElements}</div>
    </div>
  );
}
