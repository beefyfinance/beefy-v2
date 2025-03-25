import type { BoostRewardContractData } from '../../../../data/apis/contract-data/contract-data-types.ts';
import { type BigNumber } from 'bignumber.js';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenImageFromEntity } from '../../../../../components/TokenImage/TokenImage.tsx';
import { TokenAmount } from '../../../../../components/TokenAmount/TokenAmount.tsx';
import { styled } from '@repo/styles/jsx';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../../../store.ts';
import { selectTokenPriceByAddress } from '../../../../data/selectors/tokens.ts';
import { formatLargePercent, formatLargeUsd } from '../../../../../helpers/format.ts';
import type { BoostPromoEntity } from '../../../../data/entities/promo.ts';
import { selectBoostApr } from '../../../../data/selectors/apy.ts';

export type Reward = BoostRewardContractData & {
  pending: BigNumber;
  active: boolean;
};

export type RewardsProps = {
  isInBoost: boolean;
  rewards: Reward[];
  boostId: BoostPromoEntity['id'];
};

export const Rewards = memo(function Rewards({ isInBoost, rewards, boostId }: RewardsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Value>
        <Label>{t('Boost-Rewards')}</Label>
        <RewardsContainer>
          {rewards.map(reward => (
            <Amount key={reward.token.address}>
              {isInBoost && (
                <TokenAmount amount={reward.pending} decimals={reward.token.decimals} />
              )}
              {reward.token.symbol}
              <TokenImageFromEntity token={reward.token} size={16} />

              <Reward reward={reward} boostId={boostId} />
            </Amount>
          ))}
        </RewardsContainer>
      </Value>
    </>
  );
});

const Reward = memo(function Reward({
  reward,
  boostId,
}: {
  reward: Reward;
  boostId: BoostPromoEntity['id'];
}) {
  const { token, pending } = reward;
  const { t } = useTranslation();

  const price = useAppSelector(state =>
    selectTokenPriceByAddress(state, token.chainId, token.address)
  );

  const boostApy = useAppSelector(state => selectBoostApr(state, boostId));

  const pendingUsd = useMemo(() => formatLargeUsd(pending.multipliedBy(price)), [pending, price]);

  return (
    <RewardOrApy>
      {pending.gt(BIG_ZERO) ? pendingUsd : t('Boost-APR', { apr: formatLargePercent(boostApy) })}
    </RewardOrApy>
  );
});

const Value = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
});

const Label = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'text.dark',
  },
});

const Amount = styled('div', {
  base: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    textStyle: 'body.medium',
    color: 'text.middle',
  },
});

const RewardsContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
});

const RewardOrApy = styled('div', {
  base: {
    marginLeft: 'auto',
  },
});
