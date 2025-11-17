import { memo, useMemo } from 'react';
import { orderBy } from 'lodash-es';
import { styled } from '@repo/styles/jsx';
import { RewardItem, type RewardItemProps } from './RewardItem.tsx';
import type { ChainEntity } from '../../../../../data/apis/chains/entity-types.ts';

type RewardListProps = {
  chainId: ChainEntity['id'];
  deposited: boolean;
  rewards: Array<RewardItemProps['reward']>;
};

export const RewardList = memo(function RewardList({
  rewards,
  deposited,
  chainId,
}: RewardListProps) {
  const sortedRewards = useMemo(
    () => (deposited ? rewards : orderBy(rewards, r => r.apr, 'desc')),
    [rewards, deposited]
  );

  return (
    <List>
      {sortedRewards.map(r => (
        <RewardItem key={r.token.address} chainId={chainId} deposited={deposited} reward={r} />
      ))}
    </List>
  );
});

const List = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
});
