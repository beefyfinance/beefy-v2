import { memo } from 'react';
import { BadgeComponentProps } from './types';
import { useAppSelector } from '../../../../store';
import { selectUnreadActiveProposals } from '../../../../features/data/selectors/proposals';
import { NotificationDot } from './NotificationDot';

export const UnreadProposalsDot = memo<BadgeComponentProps>(function UnreadProposalsDot() {
  const proposals = useAppSelector(selectUnreadActiveProposals);
  const unreadCount = proposals.length;

  if (unreadCount === 0) {
    return null;
  }

  return <NotificationDot />;
});
