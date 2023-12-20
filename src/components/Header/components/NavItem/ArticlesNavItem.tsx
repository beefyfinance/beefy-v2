import { memo, useCallback } from 'react';
import type { NavItemProps } from '../DropNavItem/types';
import { NavItem } from './NavItem';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { UnreadArticlesDot } from '../Badges/UnreadArticlesDot';
import { selectLastArticle } from '../../../../features/data/selectors/articles';
import { articlesActions } from '../../../../features/data/reducers/articles';

export const ArticlesNavItem = memo<NavItemProps>(function ArticlesNavItem({ url, title, Icon }) {
  const lastArticle = useAppSelector(selectLastArticle);
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    if (lastArticle) {
      dispatch(articlesActions.setLastReadArticleId(lastArticle.id));
    }
  }, [dispatch, lastArticle]);

  return (
    <NavItem url={url} title={title} Icon={Icon} onClick={markRead} Badge={UnreadArticlesDot} />
  );
});
