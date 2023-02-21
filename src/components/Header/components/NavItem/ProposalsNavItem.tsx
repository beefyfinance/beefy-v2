import { memo, useCallback } from 'react';
import { NavItemProps } from '../DropNavItem/types';
import { NavItem } from './NavItem';
import { markAllProposalsRead } from '../../../../features/data/actions/proposal';
import { useAppDispatch } from '../../../../store';
import { UnreadProposalsCount } from '../Badges/UnreadProposalsCount';

export const ProposalsNavItem = memo<NavItemProps>(function ({ url, title, Icon }) {
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    dispatch(markAllProposalsRead());
  }, [dispatch]);

  return (
    <NavItem url={url} title={title} Icon={Icon} onClick={markRead} Badge={UnreadProposalsCount} />
  );
});
