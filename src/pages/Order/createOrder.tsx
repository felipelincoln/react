import { useState } from 'react';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { formatEther } from 'viem';

interface CreateOrderLoaderData {
  tokenId: string;
}

export function loader({ params }: LoaderFunctionArgs): CreateOrderLoaderData {
  return { tokenId: params.tokenId! };
}

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
  '11': 'https://i.seadn.io/s/raw/files/ce5d94ec6f0673cff36c46b8bb001b60.png?auto=format&dpr=1&w=1000',
  '12': 'https://i.seadn.io/gae/ZO3bOnTwOL0P7mxxaRur5XBVoHNDvutLpfSa-RK--4uFkEJ5QAFxcFl-36DHcLwO_sEBEEr3bpR2yO0T4lUefRbh6zngwekSyMZG?auto=format&dpr=1&w=1000',
  '13': 'https://i.seadn.io/gae/mt4oqMk73FaftZG9EduIstCCAb_9HdaBZ0sz8X5Z-a-kdCLs1VeHPKQ0Sa4VS4C3qPbws6AcwWxeu3lvPFw_bL01Q8mX57EswfWUAg?auto=format&dpr=1&w=1000',
  '14': 'https://i.seadn.io/gae/7lyxmy9q3mVMTc0IM68azP_OTqyUmh3D4TIUlcZYQ1U5XrpUIy7wM1F7EYaoP5VFgvmC8IOHQt-5hib95CpAmXS5j7whTyDdeePaDg?auto=format&dpr=1&w=1000',
  '15': 'https://i.seadn.io/gae/Iu6x-IBxyMO19Fb8zyzUDOG-nMXt6NdiYWHF6UKCrQnCZD2aLUnTBdStoCrlpADk6wzFM95GkDlf__bs01cxuzQPAx8ZsEvWHXLDtg?auto=format&dpr=1&w=1000',
  '16': 'https://i.seadn.io/gae/H5FsTkyAk-b7vLqv51aKppEb-bwp37j9kawwNvZtHcvqmixgiWqV-S4_ZlKSaOSB7MjbzryhINjB9TsAB-rmjdW9mGLGXZW9qUlnUQ?auto=format&dpr=1&w=1000',
  '17': 'https://i.seadn.io/gae/8osp3aM0pLd90F5vdCqhWGPWfIOPdycqxHVP7l0ELLixgwCjxSuQx2mBR2gI3pCWDky3Se9l-ZZhywgJkfOS4ffQHfamKn-6lBV0-g?auto=format&dpr=1&w=1000',
  '18': 'https://i.seadn.io/gae/NdO3vJIC1UGIp7rc6Hd9SRId4XrsjNbqb45eOethXAFEV1W-KOU2552K0c2Wz-pbee38YU8snE7F2BmFBhw_cpmuAOiCWHDScjys?auto=format&dpr=1&w=1000',
  '19': 'https://i.seadn.io/gae/3FlK6rXeafWdztiUFT1lc_obC2rSzwFgXdjnbLNcxT98Mi39NQWKr4ihbIxacPhtgNIeHROT8L30T4PX7-Rf6VZ1LyoNvQLDaeSLGxQ?auto=format&dpr=1&w=1000',
  '20': 'https://i.seadn.io/gae/JGg8m2hLUopwt6UU8z67ZHaJkjWfpT0NzpzSw2JN4lHRCWTen4_I0lHNItgOnvbafnigUOh8F9-zps6GmGyB6wftHpaE0aEnHyHIprI?auto=format&dpr=1&w=1000',
};

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
      created_at: 1696136343000,
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
      created_at: 1697504819000,
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
      created_at: 1698008819000,
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

interface NotificationsCountByAddressArgs {
  address: string;
}

function notificationsCountByAddress(args: NotificationsCountByAddressArgs): number {
  return eventsByAddress({ address: args.address }).length;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { tokenId } = useLoaderData() as CreateOrderLoaderData;
  const [ethPrice, setEthPrice] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [acceptedTokens, setAcceptedTokens] = useState([]);
  const [acceptAnyCheck, setAcceptAnyCheck] = useState(false);

  const userTokenIds = tokensOwnedByAddress({ address: '0x' });
  const userAddress = '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D';
  const notificationsCount = notificationsCountByAddress({ address: userAddress });

  const notificationButton = (
    <a
      href={`/collection/raccools/activity/?myItems=1`}
      className="bg-green-500 text-xs rounded px-2 cursor-pointer text-black"
    >
      {notificationsCount}
    </a>
  );

  const tokens = Object.entries(thumbnails).map(([tokenId, thumbnail]) => {
    return (
      <div className="w-1/3">
        <img className="w-full" src={thumbnail} />
        <div className="text-center">Raccools #{tokenId}</div>
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
            <div>
              {userTokenIds.length} RACCOOL {notificationButton}
            </div>
            <div>0.013546 ETH</div>
            <div>mande.eth</div>
          </div>
        </div>
      </div>
      <div>
        <div style={{ width: '100%' }}>
          <button onClick={() => navigate(`/collection/raccools/items?myItems=1`)}>
            {'<'} back
          </button>
          <h2>Create order</h2>
          <div>ETH</div>
          <input
            className="text-black"
            type="number"
            value={ethPrice}
            onChange={(e) => setEthPrice(e.target.value)}
          />
          <div>Raccools</div>
          <input
            className="text-black"
            type="number"
            value={tokenPrice}
            onChange={(e) => setTokenPrice(e.target.value)}
          />
          <div>Expire Date</div>
          <input className="text-black" type="date" />
          <div>Select accepted tokens</div>
          <label>accept any</label>
          <input type="checkbox" />

          <div className="flex flex-wrap">{tokens}</div>
          <div className="fixed bottom-0 flex bg-gray-900">
            <div className="w-1/3">
              <img className="w-full" src={thumbnails[tokenId]} />
              <div className="text-center">Raccools #{tokenId}</div>
            </div>
            <div className="w-2/3">
              <div>You receive</div>
              {<div className="w-full bg-gray-600">{formatEther(BigInt(ethPrice))} ETH</div>}
              <div className="w-full bg-gray-600 mt-1">
                <div>{tokenPrice} Raccools</div>
                <hr />
                {[]}
              </div>
              <button className="w-1/3" onClick={() => navigate(`/collection/raccools/items`)}>
                Cancel
              </button>
              <button className="w-2/3 bg-green-500 disabled:bg-gray-500">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
