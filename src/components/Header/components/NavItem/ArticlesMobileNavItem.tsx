import { memo, useCallback } from 'react';
import type { NavItemProps } from '../DropNavItem/types';
import { NavItemMobile } from './NavItem';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { UnreadArticleDot } from '../Badges/UnreadDots';
import { selectLastArticle } from '../../../../features/data/selectors/articles';
import { articlesActions } from '../../../../features/data/reducers/articles';

export const ArticlesMobileNavItem = memo<NavItemProps>(function ArticlesMobileNavItem({
  url,
  title,
  Icon,
  className,
  onClick,
}) {
  const lastArticle = useAppSelector(selectLastArticle);
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    if (lastArticle) {
      dispatch(articlesActions.setLastReadArticleId(lastArticle.id));
    }
    if (onClick) {
      onClick();
    }
  }, [dispatch, lastArticle, onClick]);

  return (
    <NavItemMobile
      url={url}
      title={title}
      Icon={Icon}
      onClick={markRead}
      className={className}
      Badge={UnreadArticleDot}
    />
  );
});
