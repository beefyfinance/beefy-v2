import { memo } from 'react';
import { NotificationDot } from './NotificationDot.tsx';
import { useHaveUnreadArticle, useHaveUnreadProposal } from './hooks.ts';
import { styled } from '@repo/styles/jsx';
import { Count } from '../../../Count/Count.tsx';

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

export const UnreadArticlesCount = memo(function UnreadArticlesCount() {
  const haveUnreadArticle = useHaveUnreadArticle();
  return haveUnreadArticle ? <CountDot data-count={1} /> : null;
});

const CustomNotificationDot = styled(NotificationDot, {
  base: {
    top: '-5px',
    right: '-5px',
  },
});

const CountDot = styled(Count, {
  base: {
    marginLeft: 'auto',
  },
});
