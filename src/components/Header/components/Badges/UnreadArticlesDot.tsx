import { memo, useMemo } from 'react';
import type { BadgeComponentProps } from './types';
import { useAppSelector } from '../../../../store';
import { NotificationDot } from './NotificationDot';
import {
  selectLastArticle,
  selectLastReadArticleId,
} from '../../../../features/data/selectors/articles';

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export const UnreadArticlesDot = memo<BadgeComponentProps>(function UnreadArticlessDot(props) {
  const lastArticle = useAppSelector(selectLastArticle);
  const lastReadArticleId = useAppSelector(selectLastReadArticleId);

  const showDot = useMemo(() => {
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

  if (!showDot) {
    return null;
  }

  return <NotificationDot {...props} />;
});
