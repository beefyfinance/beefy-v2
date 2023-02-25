import { memo } from 'react';
import { BadgeComponentProps } from './types';
import { useAppSelector } from '../../../../store';
import { selectUnreadActiveProposals } from '../../../../features/data/selectors/proposals';
import { NotificationCount } from './NotificationCount';

export const UnreadProposalsCount = memo<BadgeComponentProps>(function UnreadProposalsCount() {
  const proposals = useAppSelector(selectUnreadActiveProposals);
  const unreadCount = proposals.length;

  if (unreadCount === 0) {
    return null;
  }

  return <NotificationCount count={unreadCount} />;
});
