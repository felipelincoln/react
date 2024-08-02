import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCollection, fetchUserNotifications, fetchUserTokenIds } from '../../api/query';
import { AccountButton } from './AccountButton';
import { useAccount, useBalance } from 'wagmi';
import { etherToString } from '../../utils';
import { Button } from './Button';
import { ActivityButton } from './ActivityButton';
import { useEffect, useRef } from 'react';
import { postViewUserNotifications } from '../../api/mutation';
import { CollectoorLogo } from './CollectoorLogo';
import { config } from '../../config';

export function Navbar({
  activityTab,
  onClickActivity,
  onClickAccount,
}: {
  activityTab: boolean;
  onClickActivity: () => void;
  onClickAccount: () => void;
}) {
  const contract = useParams().contract!;
  const navigate = useNavigate();
  const prevActivityTab = useRef<boolean>(activityTab);
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: userBalance, isPending: userBalanceIsPending } = useBalance({
    address,
  });
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: userTokenIdsResponse, isPending: userTokenIdsIsPending } = useQuery({
    enabled: !!address,
    ...fetchUserTokenIds(contract, address!),
  });
  const { data: userNotificationsResponse } = useQuery({
    enabled: !!address,
    refetchInterval: 12_000,
    staleTime: 12_000,
    ...fetchUserNotifications(contract, address!),
  });

  const userNotifications = userNotificationsResponse?.data?.notifications.length;

  const {
    mutate: viewUserNotifications,
    data,
    reset,
  } = useMutation(
    postViewUserNotifications(
      userNotificationsResponse?.data?.notifications.map((n) => n._id) || [],
    ),
  );

  useEffect(() => {
    if (prevActivityTab.current && !activityTab) {
      if (userNotifications) {
        viewUserNotifications();
      }
    }

    prevActivityTab.current = activityTab;
  }, [activityTab, userNotifications, viewUserNotifications]);

  useEffect(() => {
    if (data) {
      queryClient.invalidateQueries({
        queryKey: fetchUserNotifications(contract, address!).queryKey,
      });
      reset();
    }
  }, [data, contract, address, queryClient, reset]);

  const collection = collectionResponse!.data!.collection;

  useEffect(() => {
    document.title = config.site.collectionTitle(collection.name, userNotifications);

    if (userNotifications) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] != fetchCollection(contract).queryKey[0];
        },
      });
    }
  }, [userNotifications, contract, queryClient, collection.name]);

  const userTokenIdsAmount = userTokenIdsResponse?.data?.tokenIds.length;
  const userEthBalance = etherToString(userBalance?.value);

  return (
    <div className="fixed top-0 z-20 w-full bg-zinc-900">
      <div className="h-24 flex px-8 box-content border-b-2 border-zinc-800">
        <div className="my-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <CollectoorLogo />
          <div className="text-xl text-zinc-200">
            Collectoor<span className="text-zinc-400 text-xs mr-1"> (beta)</span>
          </div>
          <div className="bg-yellow-400 text-zinc-950 text-sm px-1 rounded-md font-bold">0 fee</div>
        </div>
        <div className="flex h-8 my-8 flex-grow justify-end gap-4">
          {address && (
            <>
              <Button
                disabled
                loading={userTokenIdsIsPending}
              >{`${userTokenIdsAmount} ${collection.symbol}`}</Button>
              <Button disabled loading={userBalanceIsPending}>
                {userEthBalance}
              </Button>
              <ActivityButton count={userNotifications} onClick={onClickActivity} />
            </>
          )}
          <AccountButton onClick={onClickAccount}></AccountButton>
        </div>
      </div>
    </div>
  );
}
