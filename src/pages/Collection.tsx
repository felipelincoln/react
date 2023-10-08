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
};

const ids = ['1', '2', '3', '4'];

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
}

interface OrdersByTokenIdArgs {
  tokenIds: string[];
  includeDormantOrders?: boolean;
}

function ordersByTokenId(args: OrdersByTokenIdArgs): Order[] {
  let orders = [
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '1',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '150000000000000000',
        },
        token: {
          amount: '1',
          identifier: ['2', '3', '4'],
          identifierDescription: '',
        },
      },
      endTime: '1996123530',
      signature: '0x0000000000000000000000000000000000000000',
    },
    {
      id: 'cdb63720-9628-5ef6-bbca-2e5ce6094f3c',
      tokenId: '4',
      offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      fulfillmentCriteria: {
        coin: {
          amount: '250000000000000000',
        },
        token: {
          amount: '1',
          identifier: ['2', '3'],
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
          amount: '0',
        },
        token: {
          amount: '2',
          identifier: ['2', '3'],
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
  return ['2'];
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
  const { collectionName } = useLoaderData() as CollectionLoaderData;

  const userTokenIds = tokensOwnedByAddress({ address: '0x' });
  const myItems = searchParams.get('myItems') == '1';

  let tokenIds = myItems ? userTokenIds : ids;
  const orders = ordersByTokenId({ tokenIds });
  if (!myItems) {
    tokenIds = orders.map((order) => order.tokenId);
  }

  const ordersMap = Object.fromEntries(orders.map((order) => [order.tokenId, order]));

  const collectionItems = orders.map((order) => {
    return (
      <div className="w-2/5 shrink-0" key={order.tokenId}>
        <img src={thumbnails[order.tokenId]} />
        <div className="text-center">{order.tokenId}</div>
        <div className="flex justify-between">
          <div className="flex flex-col justify-end">
            {order.fulfillmentCriteria.coin.amount != '0' && (
              <div>{formatEther(BigInt(order.fulfillmentCriteria.coin.amount))} ETH</div>
            )}
            <div>{order.fulfillmentCriteria.token.amount} RACCOOL</div>
          </div>
          <div>
            <button className="bg-gray-800 p-3">Fulfill</button>
          </div>
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
          <div>{orders.length} Results</div>
        </div>
        <div>Attributes (0)</div>
      </div>
      <div className="flex flex-wrap justify-between">{collectionItems}</div>
    </div>
  );
}
