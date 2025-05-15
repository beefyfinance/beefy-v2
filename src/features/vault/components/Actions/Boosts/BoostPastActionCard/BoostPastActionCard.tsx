import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
} from '../../../../../data/selectors/balance.ts';
import { selectBoostById } from '../../../../../data/selectors/boosts.ts';
import { selectVaultByIdWithReceipt } from '../../../../../data/selectors/vaults.ts';
import { Claim } from '../ActionButton/Claim.tsx';
import { Unstake } from '../ActionButton/Unstake.tsx';
import { ActionConnectSwitch } from '../ActionConnectSwitch.tsx';
import { BoostStaked } from '../BoostStaked/BoostStaked.tsx';
import { type Reward, Rewards } from '../Rewards.tsx';

interface BoostPastCardActionCardProps {
  boostId: BoostPromoEntity['id'];
}

export const BoostPastActionCard = memo(function BoostPastActionCard({
  boostId,
}: BoostPastCardActionCardProps) {
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectVaultByIdWithReceipt(state, boost.vaultId));
  const userRewards = useAppSelector(state => selectBoostUserRewardsInToken(state, boost.id));
  const [rewards, canClaim] = useMemo(() => {
    let hasPendingRewards = false;
    const rewards: Reward[] = userRewards.map(userReward => {
      hasPendingRewards = hasPendingRewards || !userReward.amount.isZero();
      return {
        token: userReward.token,
        index: userReward.index,
        pending: userReward.amount,
        isPreStake: false,
        periodFinish: undefined,
        rewardRate: BIG_ZERO,
        active: false,
        apr: 0,
      };
    });
    return [rewards, hasPendingRewards];
  }, [userRewards]);

  const boostBalance = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const canUnstake = boostBalance.gt(0);
  const canClaimOnly = canClaim && (!canUnstake || boost.version >= 2);

  return (
    <BoostPastActionCardContainer>
      <CardBoostContainer>
        <BoostEnded>{t('Boost ended')}</BoostEnded>
        <BoostStaked boostId={boostId} />
        {canClaim && <Rewards isInBoost={true} rewards={rewards} />}
      </CardBoostContainer>
      {canClaim || canUnstake ?
        <ActionConnectSwitch chainId={vault.chainId}>
          {canClaimOnly && <Claim boostId={boostId} chainId={boost.chainId} />}
          {canUnstake && <Unstake boostId={boostId} chainId={boost.chainId} canClaim={canClaim} />}
        </ActionConnectSwitch>
      : null}
    </BoostPastActionCardContainer>
  );
});

const BoostEnded = styled('div', {
  base: {
    position: 'absolute',
    top: '0',
    right: '0',
    textStyle: 'body.sm',
    textTransform: 'none',
    color: 'text.black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'background.content.gray',
    borderRadius: '0px 8px 0px 8px',
    padding: '2px 8px',
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

const BoostPastActionCardContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
});
