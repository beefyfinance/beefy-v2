import { useMemo } from 'react';
import {
  selectLastArticle,
  selectLastReadArticleId,
} from '../../../../features/data/selectors/articles.ts';
import { selectUnreadActiveProposals } from '../../../../features/data/selectors/proposals.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export function useHaveUnreadArticle() {
  const lastArticle = useAppSelector(selectLastArticle);
  const lastReadArticleId = useAppSelector(selectLastReadArticleId);

  return useMemo(() => {
    const now = new Date().getTime() / 1000;

    if (
      lastArticle &&
      now - lastArticle.date <= SEVEN_DAYS_IN_SECONDS &&
      !(lastArticle.id === lastReadArticleId)
    ) {
      return true;
    }

    return false;
  }, [lastArticle, lastReadArticleId]);
}

export function useHaveUnreadProposal() {
  const proposals = useAppSelector(selectUnreadActiveProposals);

  return useMemo(() => {
    if (proposals.length === 0) {
      return false;
    }

    return true;
  }, [proposals.length]);
}
