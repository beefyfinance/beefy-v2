import { memo, useMemo } from 'react';
import type { BadgeComponentProps } from './types';
import { useAppSelector } from '../../../../store';
import { selectUnreadActiveProposals } from '../../../../features/data/selectors/proposals';
import { NotificationCount } from './NotificationCount';
import { useHaveUnreadProposal } from './hooks';

export const UnreadProposalsCount = memo<BadgeComponentProps>(function UnreadProposalsCount() {
  const proposals = useAppSelector(selectUnreadActiveProposals);
  const unreadCount = useMemo(() => {
    return proposals.length;
  }, [proposals.length]);
  const haveUnreadProposal = useHaveUnreadProposal();

  if (!haveUnreadProposal) {
    return null;
  }

  return <NotificationCount count={unreadCount} />;
});
