import { memo, useCallback } from 'react';
import { articlesActions } from '../../../../features/data/reducers/articles.ts';
import { selectLastArticle } from '../../../../features/data/selectors/articles.ts';
import { useAppDispatch, useAppSelector } from '../../../../features/data/store/hooks.ts';
import { UnreadArticleDot } from '../Badges/UnreadDots.tsx';
import type { NavItemProps } from '../DropNavItem/types.ts';
import { NavLinkItem } from './NavLinkItem.tsx';

export const ArticlesNavItem = memo<NavItemProps>(function ArticlesNavItem({ onClick, ...rest }) {
  const lastArticle = useAppSelector(selectLastArticle);
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    onClick?.();
    if (lastArticle) {
      dispatch(articlesActions.setLastReadArticleId(lastArticle.id));
    }
  }, [dispatch, lastArticle, onClick]);

  return <NavLinkItem onClick={markRead} {...rest} Badge={UnreadArticleDot} />;
});
