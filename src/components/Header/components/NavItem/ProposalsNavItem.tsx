import { memo, useCallback } from 'react';
import { markAllProposalsRead } from '../../../../features/data/actions/proposal.ts';
import { useAppDispatch } from '../../../../features/data/store/hooks.ts';
import {
  UnreadMainProposalsCount,
  UnreadProfitProposalsCount,
} from '../Badges/UnreadProposalsCount.tsx';
import type { NavItemProps } from '../DropNavItem/types.ts';
import { NavLinkItem } from './NavLinkItem.tsx';

type ProposalsNavItemProps = NavItemProps & {
  space: string;
};

const ProposalsNavItem = memo(function ProposalsNavItem({ space, ...rest }: ProposalsNavItemProps) {
  const dispatch = useAppDispatch();
  const markRead = useCallback(() => {
    dispatch(markAllProposalsRead({ space }));
  }, [dispatch, space]);

  return <NavLinkItem {...rest} onClick={markRead} />;
});

export const MainProposalsNavItem = memo<NavItemProps>(function MainProposalNavItem(props) {
  return <ProposalsNavItem {...props} space="beefydao.eth" Badge={UnreadMainProposalsCount} />;
});

export const ProfitProposalsNavItem = memo<NavItemProps>(function ProfitProposalNavItem(props) {
  return (
    <ProposalsNavItem {...props} space="profit.beefy.eth" Badge={UnreadProfitProposalsCount} />
  );
});
