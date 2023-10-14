import {
  LoaderFunctionArgs,
  Navigate,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
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
interface Order {
  id: string;
  tokenId: string;
  offerer: string;
  fulfillmentCriteria: {
    coin: {
      amount: string;
    };
    token: {
      amount: string;
      identifier: string[];
      identifierDescription: string;
    };
  };
  endTime: string;
  signature?: string;
  metadata?: OrderMetadata;
}

interface OrderMetadata {
  userCanFulfill: boolean;
}

interface OrdersByTokenIdArgs {
  tokenIds: string[];
  includeDormantOrders?: boolean;
}

function ordersByTokenId(args: OrdersByTokenIdArgs): Order[] {
  let orders = [
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '2',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '150000000000000000',
        },
        token: {
          amount: '1',
          identifier: ['6'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
      signature: '0x0000000000000000000000000000000000000000',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '3',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '250000000000000000',
        },
        token: {
          amount: '1',
          identifier: ['7', '8', '9', '10'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '5',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '0',
        },
        token: {
          amount: '1',
          identifier: ['2', '4'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
      signature: '0x0000000000000000000000000000000000000000',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '6',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '0',
        },
        token: {
          amount: '1',
          identifier: ['4', '5'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
      signature: '0x0000000000000000000000000000000000000000',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '7',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '0',
        },
        token: {
          amount: '1',
          identifier: ['1'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '8',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '1000000000000000000',
        },
        token: {
          amount: '1',
          identifier: ['1'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
      signature: '0x0000000000000000000000000000000000000000',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '9',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '1000000000000000000',
        },
        token: {
          amount: '2',
          identifier: ['5', '6'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
      signature: '0x0000000000000000000000000000000000000000',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '10',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '375000000000000000',
        },
        token: {
          amount: '2',
          identifier: ['1', '2'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
      signature: '0x0000000000000000000000000000000000000000',
    },
  ];

  if (!args.includeDormantOrders) {
    orders = orders.filter((order) => !!order.signature);
  }

  orders = orders.filter((order) => args.tokenIds.includes(order.tokenId));

  return orders;
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

export default function CollectionPage() {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  // const { collectionName } = useLoaderData() as CollectionLoaderData;

  const userTokenIds = tokensOwnedByAddress({ address: '0x' });
  const myItems = searchParams.get('myItems') == '1';

  let tokenIds = myItems ? userTokenIds : ids;
  const orderList = ordersByTokenId({ tokenIds, includeDormantOrders: myItems }).map((order) => {
    const userCanFulfill = !!userTokenIds.find((id) =>
      order.fulfillmentCriteria.token.identifier.includes(id),
    );

    return { ...order, metadata: { userCanFulfill } } as Order;
  });

  if (!myItems) {
    tokenIds = orderList
      .sort(({ fulfillmentCriteria: a }, { fulfillmentCriteria: b }) => {
        const aCoinAmount = BigInt(a.coin.amount);
        const bCoinAmount = BigInt(b.coin.amount);
        let coinOrder;

        if (aCoinAmount > bCoinAmount) {
          coinOrder = 1;
        } else if (aCoinAmount < bCoinAmount) {
          coinOrder = -1;
        } else {
          coinOrder = 0;
        }

        const aTokenAmount = BigInt(a.token.amount);
        const bTokenAmount = BigInt(b.token.amount);
        let tokenOrder;

        if (aTokenAmount > bTokenAmount) {
          tokenOrder = 1;
        } else if (aTokenAmount < bTokenAmount) {
          tokenOrder = -1;
        } else {
          tokenOrder = 0;
        }

        return coinOrder + 10 * tokenOrder;
      })
      .map((order) => order.tokenId);
  }

  const ordersMap: { [tokenId: string]: Order | undefined } = Object.fromEntries(
    orderList.map((order) => [order.tokenId, order]),
  );

  const collectionItems = tokenIds.map((tokenId) => {
    const ownedByUser = userTokenIds.includes(tokenId);
    const order = ordersMap[tokenId];
    const orderDetailsElement = order && (
      <div className="flex justify-between">
        <div className="flex flex-col justify-end">
          {order.fulfillmentCriteria.coin.amount != '0' && (
            <div>{formatEther(BigInt(order.fulfillmentCriteria.coin.amount))} ETH</div>
          )}
          <div>{order.fulfillmentCriteria.token.amount} RACCOOL</div>
        </div>
        <div>
          {ownedByUser ? (
            <>
              <button className="bg-gray-800 p-3">Cancel</button>
              {order.signature ? (
                <button className="bg-gray-800 p-3">Hide</button>
              ) : (
                <button className="bg-pink-700 p-3">Publish</button>
              )}
            </>
          ) : order.metadata?.userCanFulfill ? (
            <button className="bg-pink-700 p-3">Fulfill</button>
          ) : (
            <button className="bg-gray-800 p-3">View</button>
          )}
        </div>
      </div>
    );
    return (
      <div className="w-2/5 shrink-0" key={tokenId}>
        <img src={thumbnails[tokenId]} />
        <div className="text-center">{tokenId}</div>
        {orderDetailsElement || <button className="bg-pink-700 p-3 w-full">Create Order</button>}
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
          <div>Items</div>
          <div>Activity</div>
        </div>
        <div className="flex space-x-1" onClick={() => navigate(`?myItems=${+!myItems}`)}>
          <div>My Items</div>
          <input checked={myItems} type="checkbox" />
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <div>{tokenIds.length} Results</div>
        </div>
        <div>Attributes (0)</div>
      </div>
      <div className="flex flex-wrap justify-between">{collectionItems}</div>
    </div>
  );
}
