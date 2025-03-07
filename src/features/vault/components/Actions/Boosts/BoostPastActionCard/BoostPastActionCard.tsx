import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
} from '../../../../../data/selectors/balance.ts';
import { styles } from './styles.ts';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens.ts';
import { selectBoostById } from '../../../../../data/selectors/boosts.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { type Reward, Rewards } from '../Rewards.tsx';
import { Claim } from '../ActionButton/Claim.tsx';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { Unstake } from '../ActionButton/Unstake.tsx';
import { ActionConnectSwitch } from '../ActionConnectSwitch.tsx';

const useStyles = legacyMakeStyles(styles);

interface BoostPastCardActionCardProps {
  boostId: BoostPromoEntity['id'];
}

export const BoostPastActionCard = memo(function BoostPastActionCard({
  boostId,
}: BoostPastCardActionCardProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectStandardVaultById(state, boost.vaultId));
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
      };
    });
    return [rewards, hasPendingRewards];
  }, [userRewards]);
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const boostBalance = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const canUnstake = boostBalance.gt(0);
  const canClaimOnly = canClaim && (!canUnstake || boost.version >= 2);

  return (
    <div className={classes.expiredBoostContainer}>
      <div className={classes.title}>
        <div className={classes.expiredBoostName}>
          {t('Boost-NameBoost', { name: boost.title })}
        </div>
      </div>
      <div>
        <div className={classes.label}>{t('Staked')}</div>
        <div className={classes.value}>
          <TokenAmount amount={boostBalance} decimals={depositToken.decimals} />
          {depositToken.symbol}
        </div>
      </div>
      {canClaim && (
        <Rewards isInBoost={true} rewards={rewards} css={styles.pastRewards} fadeInactive={false} />
      )}
      {canClaim || canUnstake ? (
        <ActionConnectSwitch chainId={vault.chainId}>
          {canClaimOnly && <Claim boostId={boostId} chainId={boost.chainId} />}
          {canUnstake && <Unstake boostId={boostId} chainId={boost.chainId} canClaim={canClaim} />}
        </ActionConnectSwitch>
      ) : null}
    </div>
  );
});
