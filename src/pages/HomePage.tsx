import { Footer, HomeBanner, NavbarHome, PriceTag, SpinnerIcon, VerifiedBadge } from './components';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectionTrending } from '../api/query';
import { useNavigate } from 'react-router-dom';
import { verifiedCollections } from '../verifiedCollections';
import { etherToString } from '../utils';
import { useEffect } from 'react';
import { config } from '../config';

export function HomePage() {
  const navigate = useNavigate();
  const { data: fetchCollectionListResponse, isLoading } = useQuery(fetchCollectionTrending());
  const trendingList = fetchCollectionListResponse?.data?.trending.map((collection) => {
    const isVerified = !!verifiedCollections[collection.collection.contract];
    return { ...collection, isVerified };
  });

  useEffect(() => {
    document.title = config.site.title;
  }, []);

  return (
    <>
      <NavbarHome />
      <div className="flex flex-col h-full">
        <HomeBanner />
        <div className="max-w-screen-lg w-full mx-auto flex-grow">
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
                            {trending.isVerified && <VerifiedBadge />}
                          </div>
                        </td>
                        <td className="pr-8">
                          <div className="flex flex-nowrap gap-2">
                            {trending.floorPrice.tokenPrice !== 0 && (
                              <PriceTag>
                                {trending.floorPrice.tokenPrice} {trending.collection.symbol}
                              </PriceTag>
                            )}
                            {BigInt(trending.floorPrice.ethPrice) +
                              BigInt(
                                verifiedCollections[trending.collection.contract]?.royalty
                                  ?.amount || '0',
                              ) !==
                              0n && (
                              <PriceTag>
                                {etherToString(
                                  BigInt(trending.floorPrice.ethPrice) +
                                    BigInt(
                                      verifiedCollections[trending.collection.contract]?.royalty
                                        ?.amount || '0',
                                    ),
                                )}
                              </PriceTag>
                            )}
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
        <Footer />
      </div>
    </>
  );
}
