import { memo } from 'react';
import type { BadgeComponentProps } from './types';
import { useAppSelector } from '../../../../store';
import { selectUnreadActiveProposalsBySpace } from '../../../../features/data/selectors/proposals';
import { NotificationCount } from './NotificationCount';

type UnreadSpaceProposalsCountProps = BadgeComponentProps & {
  space: string;
};

const UnreadSpaceProposalsCount = memo<UnreadSpaceProposalsCountProps>(
  function UnreadProposalsCount({ space }) {
    const proposals = useAppSelector(state => selectUnreadActiveProposalsBySpace(state, space));

    if (!proposals.length) {
      return null;
    }

    return <NotificationCount count={proposals.length} />;
  }
);

export const UnreadMainProposalsCount = memo<BadgeComponentProps>(
  function UnreadMainProposalsCount() {
    return <UnreadSpaceProposalsCount space="beefydao.eth" />;
  }
);

export const UnreadProfitProposalsCount = memo<BadgeComponentProps>(
  function UnreadProfitProposalsCount() {
    return <UnreadSpaceProposalsCount space="profit.beefy.eth" />;
  }
);
