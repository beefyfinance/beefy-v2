import { memo, useCallback } from 'react';
import type { NavItemProps } from '../DropNavItem/types';
import { NavItem } from './NavItem';
import { markAllProposalsRead } from '../../../../features/data/actions/proposal';
import { useAppDispatch } from '../../../../store';
import {
  UnreadMainProposalsCount,
  UnreadProfitProposalsCount,
} from '../Badges/UnreadProposalsCount';

type ProposalsNavItemProps = NavItemProps & {
  space: string;
};

const ProposalsNavItem = memo<ProposalsNavItemProps>(function ProposalsNavItem({ space, ...rest }) {
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    dispatch(markAllProposalsRead({ space }));
  }, [dispatch, space]);

  return <NavItem {...rest} onClick={markRead} />;
});

export const MainProposalsNavItem = memo<NavItemProps>(function MainProposalNavItem(props) {
  return <ProposalsNavItem {...props} space="beefydao.eth" Badge={UnreadMainProposalsCount} />;
});

export const ProfitProposalsNavItem = memo<NavItemProps>(function ProfitProposalNavItem(props) {
  return (
    <ProposalsNavItem {...props} space="profit.beefy.eth" Badge={UnreadProfitProposalsCount} />
  );
});
