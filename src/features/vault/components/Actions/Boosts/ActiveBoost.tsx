import { memo, useMemo, useState } from 'react';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { Trans, useTranslation } from 'react-i18next';
import { styles } from './styles.ts';
import { selectVaultById } from '../../../../data/selectors/vaults.ts';
import {
  selectBoostActiveRewards,
  selectBoostById,
  selectBoostContractState,
} from '../../../../data/selectors/boosts.ts';
import type { BoostPromoEntity } from '../../../../data/entities/promo.ts';
import {
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectUserBalanceOfToken,
} from '../../../../data/selectors/balance.ts';
import { useAppSelector } from '../../../../../store.ts';
import { IconWithBasicTooltip } from '../../../../../components/Tooltip/IconWithBasicTooltip.tsx';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { ActionConnectSwitch } from './ActionConnectSwitch.tsx';
import { type Reward, Rewards } from './Rewards.tsx';
import { Claim } from './ActionButton/Claim.tsx';
import { Unstake } from './ActionButton/Unstake.tsx';
import { StakeInput } from './ActionInputButton/StakeInput.tsx';
import { UnstakeInput } from './ActionInputButton/UnstakeInput.tsx';

const useStyles = legacyMakeStyles(styles);

export function ActiveBoost({ boostId }: { boostId: BoostPromoEntity['id'] }) {
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectVaultById(state, boost.vaultId));
  const data = useAppSelector(state => selectBoostContractState(state, boost.id));
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
  const classes = useStyles();
  const [open, toggleOpen] = useAccordion<'stake' | 'unstake'>();

  return (
    <div className={classes.containerBoost}>
      <Title upcoming={data.isPreStake} />
      <Rewards isInBoost={canUnstake} rewards={rewards} />
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
    </div>
  );
}

type TitleProps = {
  upcoming?: boolean;
};

const Title = memo(function Title({ upcoming }: TitleProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div className={classes.title}>
      <span>
        <Trans
          t={t}
          i18nKey="Boost-Title"
          values={{ title: t(upcoming ? 'Boost-Upcoming' : 'Boost-Active') }}
          components={{ white: <span className={classes.titleWhite} /> }}
        />
      </span>
      <IconWithBasicTooltip
        title={t('Boost-WhatIs')}
        content={t('Boost-Explain')}
        iconCss={styles.titleTooltipTrigger}
      />
    </div>
  );
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
