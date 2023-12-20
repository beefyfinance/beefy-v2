import { memo } from 'react';
import { NotificationDot } from './NotificationDot';
import type { BadgeComponentProps } from './types';
import { useHaveUnreadArticle, useHaveUnreadProposal } from './hooks';

export const UnreadDots = memo<BadgeComponentProps>(function UnreadDots(props) {
  const haveUnreadArticle = useHaveUnreadArticle();
  const haveUnreadProposal = useHaveUnreadProposal();

  return haveUnreadArticle || haveUnreadProposal ? <NotificationDot {...props} /> : null;
});

export const UnreadArticleDot = memo<BadgeComponentProps>(function UnreadArticleDot(props) {
  const haveUnreadArticle = useHaveUnreadArticle();

  return haveUnreadArticle ? <NotificationDot {...props} /> : null;
});

export const UnreadProposalDot = memo<BadgeComponentProps>(function UnreadProposalDot(props) {
  const haveUnreadProposal = useHaveUnreadProposal();

  return haveUnreadProposal ? <NotificationDot {...props} /> : null;
});
