import { memo, useCallback } from 'react';
import { NavItemProps } from '../DropNavItem/types';
import { NavItemMobile } from './NavItem';
import { markAllProposalsRead } from '../../../../features/data/actions/proposal';
import { useAppDispatch } from '../../../../store';
import { UnreadProposalsCount } from '../Badges/UnreadProposalsCount';

export const ProposalsMobileNavItem = memo<NavItemProps>(function ({
  url,
  title,
  Icon,
  className,
  onClick,
}) {
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    dispatch(markAllProposalsRead());
    if (onClick) {
      onClick();
    }
  }, [dispatch, onClick]);

  return (
    <NavItemMobile
      url={url}
      title={title}
      Icon={Icon}
      onClick={markRead}
      className={className}
      Badge={UnreadProposalsCount}
    />
  );
});
