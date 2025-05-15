import { styled } from '@repo/styles/jsx';
import { maxBy } from 'lodash-es';
import { memo, useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { TimeUntil } from '../../../../../components/TimeUntil/TimeUntil.tsx';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import type { BoostPromoEntity } from '../../../../data/entities/promo.ts';
import { selectBoostAprByRewardToken } from '../../../../data/selectors/apy.ts';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectUserBalanceOfToken,
} from '../../../../data/selectors/balance.ts';
import { selectBoostActiveRewards, selectBoostById } from '../../../../data/selectors/boosts.ts';
import { selectVaultById } from '../../../../data/selectors/vaults.ts';
import { Claim } from './ActionButton/Claim.tsx';
import { Unstake } from './ActionButton/Unstake.tsx';
import { ActionConnectSwitch } from './ActionConnectSwitch.tsx';
import { StakeInput } from './ActionInputButton/StakeInput.tsx';
import { UnstakeInput } from './ActionInputButton/UnstakeInput.tsx';
import { type Reward, Rewards } from './Rewards.tsx';

export const ActiveBoost = memo(function ActiveBoost({
  boostId,
}: {
  boostId: BoostPromoEntity['id'];
}) {
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectVaultById(state, boost.vaultId));
  const activeRewards = useAppSelector(state => selectBoostActiveRewards(state, boost.id));
  const userRewards = useAppSelector(state => selectBoostUserRewardsInToken(state, boost.id));
  const aprByRewardToken = useAppSelector(state => selectBoostAprByRewardToken(state, boost.id));
  const [rewards, canClaim] = useMemo(() => {
    let hasPendingRewards = false;
    const allRewards: Reward[] = activeRewards.map(reward => {
      const userReward = userRewards.find(r => r.token.address === reward.token.address);
      return {
        ...reward,
        active: true,
        pending: userReward?.amount || BIG_ZERO,
        apr: aprByRewardToken.find(r => r.rewardToken === reward.token.address)?.apr || 0,
      };
    });
    for (const userReward of userRewards) {
      if (!userReward.amount.isZero()) {
        hasPendingRewards = true;
        if (!allRewards.find(r => r.token.address === userReward.token.address)) {
          allRewards.push({
            token: userReward.token,
            index: userReward.index,
            pending: userReward.amount,
            isPreStake: false,
            periodFinish: undefined,
            rewardRate: BIG_ZERO,
            active: false,
            apr: aprByRewardToken.find(r => r.rewardToken === userReward.token.address)?.apr || 0,
          } satisfies Reward);
        }
      }
    }

    return [allRewards, hasPendingRewards];
  }, [activeRewards, aprByRewardToken, userRewards]);
  const balanceInWallet = useAppSelector(state =>
    selectUserBalanceOfToken(state, boost.chainId, vault.contractAddress)
  );
  const canStake = balanceInWallet.gt(BIG_ZERO);
  const balanceInBoost = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const canUnstake = balanceInBoost.gt(BIG_ZERO);
  const [open, toggleOpen] = useAccordion<'stake' | 'unstake'>(canStake ? 'stake' : undefined);
  const reward = useMemo(() => maxBy(rewards, r => r.periodFinish?.getTime() || 0), [rewards]);
  const renderFuture = useCallback(
    (timeLeft: string) => <Trans t={t} i18nKey="Boost-Ends" values={{ timeLeft }} />,
    [t]
  );

  return (
    <BoostActionContainer>
      <CardBoostContainer>
        {reward?.periodFinish && (
          <BoostCountdown>
            <TimeUntil
              time={reward.periodFinish}
              minParts={1}
              maxParts={3}
              padLength={2}
              renderFuture={renderFuture}
              renderPast={<>{t('Finished')}</>}
            />
          </BoostCountdown>
        )}
        <Rewards isInBoost={canUnstake} rewards={rewards} />
      </CardBoostContainer>
      <ActionConnectSwitch chainId={boost.chainId}>
        {canStake && (
          <StakeInput
            boostId={boostId}
            open={open}
            toggleOpen={toggleOpen}
            balance={balanceInWallet}
          />
        )}
        {canUnstake && (
          <UnstakeInput
            boostId={boostId}
            open={open}
            toggleOpen={toggleOpen}
            balance={balanceInBoost}
          />
        )}
        {(canClaim || canUnstake) && (
          <>
            <Claim boostId={boost.id} chainId={boost.chainId} disabled={!canClaim} />
            <Unstake
              boostId={boost.id}
              chainId={boost.chainId}
              canClaim={canClaim}
              disabled={!canUnstake || !canClaim}
            />
          </>
        )}
      </ActionConnectSwitch>
    </BoostActionContainer>
  );
});

const BoostActionContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
});

const CardBoostContainer = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'background.content.light',
    borderRadius: '8px',
    padding: '16px',
  },
});

const BoostCountdown = styled('div', {
  base: {
    position: 'absolute',
    colorPalette: 'status.waiting',
    top: '0',
    right: '0',
    textStyle: 'body.sm',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'colorPalette.text',
    backgroundColor: 'colorPalette.background',
    borderRadius: '0px 8px 0px 3px',
    padding: '0px 8px',
  },
});

function useAccordion<T extends string>(initialState: T | undefined = undefined) {
  const [open, setOpen] = useState<T | undefined>(initialState);
  return useMemo(() => {
    const handleToggle = (value: T) => {
      setOpen(prev => (prev === value ? undefined : value));
    };
    return [open, handleToggle] as const;
  }, [open, setOpen]);
}
