import { NavbarHome, PriceTag, SpinnerIcon } from './components';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectionTrending } from '../api/query';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const { data: fetchCollectionListResponse, isLoading } = useQuery(fetchCollectionTrending());
  const trendingList = fetchCollectionListResponse?.data?.trending;

  return (
    <>
      <NavbarHome />
      <div className="max-w-screen-lg w-full mx-auto">
        <div className="p-8 flex flex-col gap-8">
          <div>
            <h1>Trending collections</h1>
          </div>

          {isLoading && <SpinnerIcon />}
          {trendingList && (
            <div className="flex flex-col gap-2">
              <table>
                <thead>
                  <tr className="*:font-normal text-sm text-zinc-400 text-left">
                    <th className="pl-4"></th>
                    <th className="pr-8">Collection</th>
                    <th className="pr-8">Floor price</th>
                    <th className="pr-8">Listings</th>
                    <th>Trades</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingList?.map((trending, index) => (
                    <tr
                      key={trending.collection.contract}
                      onClick={() => navigate(`/c/${trending.collection.contract}`)}
                      className="cursor-pointer hover:bg-zinc-800 *:py-2"
                    >
                      <td className="pl-4 text-zinc-400 text-sm">{index + 1}</td>
                      <td className="pr-8">
                        <div className="flex items-center gap-2">
                          <img src={trending.collection.image} className="w-10 h-10 rounded" />
                          {trending.collection.name}
                        </div>
                      </td>
                      <td className="pr-8">
                        <div className="flex flex-nowrap gap-2">
                          <PriceTag>0 ETH</PriceTag>
                          <PriceTag>0 {trending.collection.symbol}</PriceTag>
                        </div>
                      </td>
                      <td className="pr-8">{trending.listings}</td>
                      <td>{trending.trades}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
