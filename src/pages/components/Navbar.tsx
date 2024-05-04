import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchCollection, fetchUserNotifications, fetchUserTokenIds } from '../../api';
import { AccountButton } from './AccountButton';
import { useAccount, useBalance } from 'wagmi';
import { etherToString } from '../../utils';
import { Button } from './Button';
import { ActivityButton } from './ActivityButton';
import { useEffect } from 'react';

export function Navbar({
  onClickActivity,
  onClickAccount,
}: {
  onClickActivity: Function;
  onClickAccount: Function;
}) {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: userBalance, isPending: userBalanceIsPending } = useBalance({ address });
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: userTokenIdsResponse, isPending: userTokenIdsIsPending } = useQuery({
    enabled: !!address,
    ...fetchUserTokenIds(contract, address!),
  });
  const { data: userNotificationsResponse } = useQuery({
    enabled: !!address,
    staleTime: 12_000,
    ...fetchUserNotifications(contract, address!),
  });

  useEffect(() => {
    if (userNotificationsResponse?.data?.notifications.length) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] != fetchCollection(contract).queryKey[0];
        },
      });
    }
  }, [userNotificationsResponse?.data?.notifications.map((n) => n.activityId).join('-')]);

  const collection = collectionResponse!.data!.collection;
  const userTokenIdsAmount = userTokenIdsResponse?.data?.tokenIds.length;
  const userEthBalance = etherToString(userBalance?.value);
  const userNotifications = userNotificationsResponse?.data?.notifications.length;

  return (
    <div className="fixed top-0 z-20 w-full bg-zinc-900">
      <div className="h-24 flex px-8 border-b-2 border-zinc-800">
        <div className="my-4 h-16 w-16 bg-zinc-800 rounded"></div>
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
