import { memo, useMemo, useState } from 'react';
import { selectVaultById } from '../../../../data/selectors/vaults.ts';
import { selectBoostActiveRewards, selectBoostById } from '../../../../data/selectors/boosts.ts';
import type { BoostPromoEntity } from '../../../../data/entities/promo.ts';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectUserBalanceOfToken,
} from '../../../../data/selectors/balance.ts';
import { useAppSelector } from '../../../../../store.ts';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { ActionConnectSwitch } from './ActionConnectSwitch.tsx';
import { type Reward, Rewards } from './Rewards.tsx';
import { Claim } from './ActionButton/Claim.tsx';
import { Unstake } from './ActionButton/Unstake.tsx';
import { StakeInput } from './ActionInputButton/StakeInput.tsx';
import { UnstakeInput } from './ActionInputButton/UnstakeInput.tsx';
import { styled } from '@repo/styles/jsx';
import { StakeCountdown } from './StakeCountdown/StakeCountdown.tsx';
import { Trans, useTranslation } from 'react-i18next';
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
  const [rewards, canClaim] = useMemo(() => {
    let hasPendingRewards = false;
    const allRewards: Reward[] = activeRewards.map(reward => {
      const userReward = userRewards.find(r => r.token.address === reward.token.address);
      return {
        ...reward,
        active: true,
        pending: userReward?.amount || BIG_ZERO,
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
          } satisfies Reward);
        }
      }
    }

    return [allRewards, hasPendingRewards];
  }, [activeRewards, userRewards]);
  const balanceInWallet = useAppSelector(state =>
    selectUserBalanceOfToken(state, boost.chainId, vault.contractAddress)
  );
  const canStake = balanceInWallet.gt(BIG_ZERO);
  const balanceInBoost = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const canUnstake = balanceInBoost.gt(BIG_ZERO);
  const [open, toggleOpen] = useAccordion<'stake' | 'unstake'>();

  return (
    <BoostActionContainer>
      <CardBoostContainer>
        <BoostCountdown>
          {rewards.map(reward => {
            return reward.isPreStake ? (
              t('PRE-STAKE')
            ) : reward.periodFinish ? (
              <Trans
                t={t}
                i18nKey="Boost-Ends"
                components={{ countdown: <StakeCountdown periodFinish={reward.periodFinish} /> }}
              />
            ) : (
              '-'
            );
          })}
        </BoostCountdown>
        <Rewards isInBoost={canUnstake} rewards={rewards} boostId={boostId} />
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
    top: '0',
    right: '0',
    textStyle: 'subline.sm',
    textTransform: 'none',
    color: 'text.notification',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'background.content.notification',
    borderRadius: '0px 8px 0px 8px',
    padding: '2px 8px',
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
