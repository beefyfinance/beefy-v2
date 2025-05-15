import { memo } from 'react';
import { selectUnreadActiveProposalsBySpace } from '../../../../features/data/selectors/proposals.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { NotificationCount } from './NotificationCount.tsx';
import type { BadgeComponentProps } from './types.ts';

type UnreadSpaceProposalsCountProps = BadgeComponentProps & {
  space: string;
};

const UnreadSpaceProposalsCount = memo(function UnreadProposalsCount({
  space,
}: UnreadSpaceProposalsCountProps) {
  const proposals = useAppSelector(state => selectUnreadActiveProposalsBySpace(state, space));

  if (!proposals.length) {
    return null;
  }

  return <NotificationCount count={proposals.length} />;
});

export const UnreadMainProposalsCount = memo(function UnreadMainProposalsCount() {
  return <UnreadSpaceProposalsCount space="beefydao.eth" />;
});

export const UnreadProfitProposalsCount = memo(function UnreadProfitProposalsCount() {
  return <UnreadSpaceProposalsCount space="profit.beefy.eth" />;
});
