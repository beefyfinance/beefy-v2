import { memo } from 'react';
import { NotificationDot } from './NotificationDot.tsx';
import { useHaveUnreadArticle, useHaveUnreadProposal } from './hooks.ts';

export const UnreadDots = memo(function UnreadDots() {
  const haveUnreadArticle = useHaveUnreadArticle();
  const haveUnreadProposal = useHaveUnreadProposal();

  return haveUnreadArticle || haveUnreadProposal ? <NotificationDot /> : null;
});

export const UnreadArticleDot = memo(function UnreadArticleDot() {
  const haveUnreadArticle = useHaveUnreadArticle();

  return haveUnreadArticle ? <NotificationDot /> : null;
});

export const UnreadProposalDot = memo(function UnreadProposalDot() {
  const haveUnreadProposal = useHaveUnreadProposal();

  return haveUnreadProposal ? <NotificationDot /> : null;
});
