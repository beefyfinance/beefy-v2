import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
import { styles } from './styles';
import { formatBigDecimals } from '../../../../../helpers/format';
import { askForNetworkChange, askForWalletConnection } from '../../../../data/actions/wallet';
import { selectVaultById } from '../../../../data/selectors/vaults';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../../data/selectors/wallet';
import { selectBoostById, selectBoostContractState } from '../../../../data/selectors/boosts';
import { walletActions } from '../../../../data/actions/wallet-actions';
import { BoostEntity } from '../../../../data/entities/boost';
import {
  selectBoostRewardsTokenEntity,
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectUserBalanceOfToken,
} from '../../../../data/selectors/balance';
import { StakeCountdown } from './StakeCountdown';

import { selectChainById } from '../../../../data/selectors/chains';
import { useAppDispatch, useAppSelector } from '../../../../../store';
import { IconWithBasicTooltip } from '../../../../../components/Tooltip/IconWithBasicTooltip';
import { Button } from '../../../../../components/Button';
import { stepperActions } from '../../../../data/reducers/wallet/stepper';
import { selectIsStepperStepping } from '../../../../data/selectors/stepper';
import { startStepper } from '../../../../data/actions/stepper';
import { BoostActionButton } from './BoostActionButton';
import { boostActions } from '../../../../data/reducers/wallet/boost';

const useStyles = makeStyles(styles);

export function ActiveBoost({ boostId, title }: { boostId: BoostEntity['id']; title: string }) {
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectVaultById(state, boost.vaultId));
  const chain = useAppSelector(state => selectChainById(state, boost.chainId));
  const rewardToken = useAppSelector(state => selectBoostRewardsTokenEntity(state, boost.id));
  const mooTokenBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, boost.chainId, vault.earnedTokenAddress)
  );
  const boostBalance = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const boostPendingRewards = useAppSelector(state =>
    selectBoostUserRewardsInToken(state, boost.id)
  );
  const { periodFinish, isPreStake } = useAppSelector(state =>
    selectBoostContractState(state, boost.id)
  );
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === boost.chainId
  );

  const isStepping = useAppSelector(selectIsStepperStepping);

  const [collapseOpen, setCollapseOpen] = useState({
    stake: false,
    unstake: false,
  });

  const handleCollapse = useCallback(
    ({ stakeUnstake }: { stakeUnstake: 'stake' | 'unstake' }) => {
      const diff = stakeUnstake === 'stake' ? 'unstake' : 'stake';
      if (collapseOpen[stakeUnstake]) dispatch(boostActions.reset());
      if (collapseOpen[diff] && collapseOpen[stakeUnstake] === false)
        setCollapseOpen(prevStatus => {
          return { ...prevStatus, [diff]: !prevStatus[diff] };
        });

      setCollapseOpen(prevStatus => {
        return { ...prevStatus, [stakeUnstake]: !prevStatus[stakeUnstake] };
      });
    },
    [collapseOpen, dispatch]
  );

  const handleExit = (boost: BoostEntity) => {
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    dispatch(
      stepperActions.addStep({
        step: {
          step: 'claim-unstake',
          message: t('Vault-TxnConfirm', { type: t('Claim-Unstake-noun') }),
          action: walletActions.exitBoost(boost),
          pending: false,
          extraInfo: {
            rewards: {
              token: rewardToken,
              amount: boostPendingRewards,
            },
          },
        },
      })
    );

    dispatch(startStepper(chain.id));
  };

  const handleClaim = () => {
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    dispatch(
      stepperActions.addStep({
        step: {
          step: 'claim-boost',
          message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
          action: walletActions.claimBoost(boost),
          pending: false,
        },
      })
    );

    dispatch(startStepper(chain.id));
  };

  return (
    <div className={classes.containerBoost}>
      <div className={classes.title}>
        <span>
          <Trans
            t={t}
            i18nKey="Boost-Title"
            values={{ title }}
            components={{ white: <span className={classes.titleWhite} /> }}
          />
        </span>
        <IconWithBasicTooltip
          title={t('Boost-WhatIs')}
          content={t('Boost-Explain')}
          triggerClass={classes.titleTooltipTrigger}
        />
      </div>
      <div className={classes.boostStats}>
        <div className={classes.boostStat}>
          <div className={classes.boostStatLabel}>{t('Boost-Rewards')}</div>
          <div className={classes.boostStatValue}>
            {formatBigDecimals(boostPendingRewards, 8)} {rewardToken.symbol}
          </div>
        </div>
        {!isPreStake ? (
          <div className={classes.boostStat}>
            <div className={classes.boostStatLabel}>{t('Boost-Ends')}</div>
            <div className={classes.boostStatValue}>
              <StakeCountdown periodFinish={periodFinish} />
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      {isWalletConnected ? (
        !isWalletOnVaultChain ? (
          <Button
            onClick={() => dispatch(askForNetworkChange({ chainId: vault.chainId }))}
            className={classes.button}
            fullWidth={true}
            borderless={true}
            disabled={isStepping}
          >
            {t('Network-Change', { network: chain.name })}
          </Button>
        ) : (
          <>
            <BoostActionButton
              boostId={boostId}
              type="stake"
              open={collapseOpen.stake}
              handleCollapse={() => handleCollapse({ stakeUnstake: 'stake' })}
              balance={mooTokenBalance}
            />
            {boostBalance.gt(0) && (
              <>
                <BoostActionButton
                  boostId={boostId}
                  type="unstake"
                  open={collapseOpen.unstake}
                  handleCollapse={() => handleCollapse({ stakeUnstake: 'unstake' })}
                  balance={boostBalance}
                />
                <Button
                  disabled={isStepping || boostPendingRewards.isZero()}
                  className={classes.button}
                  onClick={handleClaim}
                  fullWidth={true}
                  borderless={true}
                >
                  {t('Boost-Button-Withdraw')}
                </Button>
                <Button
                  disabled={isStepping || (boostBalance.isZero() && boostPendingRewards.isZero())}
                  className={classes.button}
                  onClick={() => handleExit(boost)}
                  fullWidth={true}
                  borderless={true}
                >
                  {t('Boost-Button-Claim-Unstake')}
                </Button>
              </>
            )}
          </>
        )
      ) : (
        <Button
          className={classes.button}
          fullWidth={true}
          borderless={true}
          variant="success"
          onClick={() => dispatch(askForWalletConnection())}
          disabled={isStepping}
        >
          {t('Network-ConnectWallet')}
        </Button>
      )}
    </div>
  );
}
