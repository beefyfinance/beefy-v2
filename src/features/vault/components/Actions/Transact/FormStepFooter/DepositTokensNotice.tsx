import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { ListJoin } from '../../../../../../components/ListJoin.tsx';
import { TokenImageFromEntity } from '../../../../../../components/TokenImage/TokenImage.tsx';
import type { UnifiedRewardToken } from '../../../../../data/selectors/rewards.ts';
import { ActionTokensNotice } from './ActionTokensNotice.tsx';

type DepositTokensNoticeProps = {
  i18nKey: string;
  rewardTokens: UnifiedRewardToken[];
  onClick?: () => void;
};

export const DepositTokensNotice = memo(function DepositTokensNotice({
  i18nKey,
  rewardTokens,
  onClick,
}: DepositTokensNoticeProps) {
  const { t } = useTranslation();
  const inner = useMemo(() => {
    return (
      <Trans
        i18nKey={i18nKey}
        t={t}
        values={{ count: rewardTokens.length }}
        components={{
          Tokens: <TokensList rewardTokens={rewardTokens} />,
        }}
      />
    );
  }, [i18nKey, rewardTokens, t]);

  return (
    <ActionTokensNotice children={inner} multiline={rewardTokens.length > 1} onClick={onClick} />
  );
});

const TokensList = memo(function TokensList({
  rewardTokens,
}: {
  rewardTokens: UnifiedRewardToken[];
}) {
  return (
    <RewardTokens>
      <ListJoin
        items={rewardTokens.map(reward => (
          <RewardToken key={reward.address}>
            {reward.symbol}
            <TokenImageFromEntity token={reward} size={20} />
          </RewardToken>
        ))}
      />
    </RewardTokens>
  );
});

const RewardTokens = styled('span', {
  base: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
});

const RewardToken = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    gap: '6px',
  },
});
