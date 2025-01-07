import { memo, useCallback } from 'react';
import type { NavItemProps } from '../DropNavItem/types';
import { NavItemMobile } from './NavItem';
import { markAllProposalsRead } from '../../../../features/data/actions/proposal';
import { useAppDispatch } from '../../../../store';
import {
  UnreadMainProposalsCount,
  UnreadProfitProposalsCount,
} from '../Badges/UnreadProposalsCount';

type ProposalsNavItemProps = NavItemProps & {
  space: string;
};

const ProposalsMobileNavItem = memo<ProposalsNavItemProps>(function ProposalsMobileNavItem({
  space,
  onClick,
  ...rest
}) {
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    dispatch(markAllProposalsRead({ space }));
    if (onClick) {
      onClick();
    }
  }, [dispatch, onClick, space]);

  return <NavItemMobile {...rest} onClick={markRead} />;
});

export const MainProposalsMobileNavItem = memo<NavItemProps>(function MainProposalNavItem(props) {
  return (
    <ProposalsMobileNavItem {...props} space="beefydao.eth" Badge={UnreadMainProposalsCount} />
  );
});

export const ProfitProposalsMobileNavItem = memo<NavItemProps>(function ProfitProposalNavItem(
  props
) {
  return (
    <ProposalsMobileNavItem
      {...props}
      space="profit.beefy.eth"
      Badge={UnreadProfitProposalsCount}
    />
  );
});
