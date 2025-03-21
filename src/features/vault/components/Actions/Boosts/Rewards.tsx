import type { BoostRewardContractData } from '../../../../data/apis/contract-data/contract-data-types.ts';
import { type BigNumber } from 'bignumber.js';
import { Fragment, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenImageFromEntity } from '../../../../../components/TokenImage/TokenImage.tsx';
import { TokenAmount } from '../../../../../components/TokenAmount/TokenAmount.tsx';
import { styled } from '@repo/styles/jsx';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../../../store.ts';
import { selectTokenPriceByAddress } from '../../../../data/selectors/tokens.ts';
import { formatLargeUsd } from '../../../../../helpers/format.ts';

export type Reward = BoostRewardContractData & {
  pending: BigNumber;
  active: boolean;
};

export type RewardsProps = {
  isInBoost: boolean;
  rewards: Reward[];
};

export const Rewards = memo(function Rewards({ isInBoost, rewards }: RewardsProps) {
  const { t } = useTranslation();

  console.log(rewards);

  return (
    <>
      {rewards.map(reward => (
        <Fragment key={reward.token.address}>
          <Value>
            <Label>{t('Boost-Rewards')}</Label>
            <Amount>
              {isInBoost && (
                <TokenAmount amount={reward.pending} decimals={reward.token.decimals} />
              )}
              {reward.token.symbol}
              <TokenImageFromEntity token={reward.token} size={16} />

              <Reward reward={reward} />
            </Amount>
          </Value>
        </Fragment>
      ))}
    </>
  );
});

const Reward = memo(function Reward({ reward }: { reward: Reward }) {
  const { token, pending } = reward;

  const price = useAppSelector(state =>
    selectTokenPriceByAddress(state, token.chainId, token.address)
  );

  const pendingUsd = useMemo(() => formatLargeUsd(pending.multipliedBy(price)), [pending, price]);

  return <RewardOrApy>{pending.gt(BIG_ZERO) ? pendingUsd : ''}</RewardOrApy>;
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

const RewardOrApy = styled('div', {
  base: {
    marginLeft: 'auto',
  },
});
