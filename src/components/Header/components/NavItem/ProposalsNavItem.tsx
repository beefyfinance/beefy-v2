import { memo, useCallback } from 'react';
import type { NavItemProps } from '../DropNavItem/types.ts';
import { NavLinkItem } from './NavLinkItem.tsx';
import { markAllProposalsRead } from '../../../../features/data/actions/proposal.ts';
import { useAppDispatch } from '../../../../store.ts';
import {
  UnreadMainProposalsCount,
  UnreadProfitProposalsCount,
} from '../Badges/UnreadProposalsCount.tsx';

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
