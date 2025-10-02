import { memo } from 'react';
import { NotificationDot } from './NotificationDot.tsx';
import { useHaveUnreadArticle, useHaveUnreadProposal } from './hooks.ts';
import { styled } from '@repo/styles/jsx';

export const UnreadDots = memo(function UnreadDots() {
  const haveUnreadArticle = useHaveUnreadArticle();
  const haveUnreadProposal = useHaveUnreadProposal();

  return haveUnreadArticle || haveUnreadProposal ? <CustomNotificationDot /> : null;
});

export const UnreadArticleDot = memo(function UnreadArticleDot() {
  const haveUnreadArticle = useHaveUnreadArticle();

  return haveUnreadArticle ? <CustomNotificationDot /> : null;
});

export const UnreadProposalDot = memo(function UnreadProposalDot() {
  const haveUnreadProposal = useHaveUnreadProposal();

  return haveUnreadProposal ? <CustomNotificationDot /> : null;
});

const CustomNotificationDot = styled(NotificationDot, {
  base: {
    top: '-5px',
    right: '-5px',
  },
});
