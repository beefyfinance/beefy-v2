import { makeStyles } from '@material-ui/core';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
} from '../../../../../data/selectors/balance';
import { styles } from './styles';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectBoostById } from '../../../../../data/selectors/boosts';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { type Reward, Rewards } from '../Rewards';
import { Claim } from '../ActionButton/Claim';
import { TokenAmount } from '../../../../../../components/TokenAmount';
import { Unstake } from '../ActionButton/Unstake';
import { ActionConnectSwitch } from '../ActionConnectSwitch';

const useStyles = makeStyles(styles);

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
        <Rewards
          isInBoost={true}
          rewards={rewards}
          className={classes.pastRewards}
          fadeInactive={false}
        />
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
