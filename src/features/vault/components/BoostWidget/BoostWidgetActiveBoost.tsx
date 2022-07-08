import React from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { formatBigDecimals } from '../../../../helpers/format';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { selectVaultById } from '../../../data/selectors/vaults';
import { useStepper } from '../../../../components/Steps/hooks';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../data/selectors/wallet';
import { selectBoostById, selectBoostPeriodFinish } from '../../../data/selectors/boosts';
import { Step } from '../../../../components/Steps/types';
import { walletActions } from '../../../data/actions/wallet-actions';
import { BoostEntity } from '../../../data/entities/boost';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import {
  selectBoostRewardsTokenEntity,
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectUserBalanceOfToken,
} from '../../../data/selectors/balance';
import { StakeCountdown } from './StakeCountdown';
import { Stake } from './Stake';
import { Unstake } from './Unstake';
import { selectChainById } from '../../../data/selectors/chains';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { IconWithBasicTooltip } from '../../../../components/Tooltip/IconWithBasicTooltip';
import { Button } from '../../../../components/Button';
import { Modal } from '../../../../components/Modal';

const useStyles = makeStyles(styles);

export function BoostWidgetActiveBoost({ boostId }: { boostId: BoostEntity['id'] }) {
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const vault = useAppSelector(state => selectVaultById(state, boost.vaultId));
  const chain = useAppSelector(state => selectChainById(state, boost.chainId));
  const isBoosted = true;

  const mooToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );
  const rewardToken = useAppSelector(state => selectBoostRewardsTokenEntity(state, boost.id));

  const mooTokenBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, boost.chainId, vault.earnedTokenAddress)
  );
  const boostBalance = useAppSelector(state => selectBoostUserBalanceInToken(state, boost.id));
  const boostPendingRewards = useAppSelector(state =>
    selectBoostUserRewardsInToken(state, boost.id)
  );

  const periodFinish = useAppSelector(state => selectBoostPeriodFinish(state, boost.id));
  const isPreStake = periodFinish === null;

  const classes = useStyles({ isBoosted });
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === boost.chainId
  );

  const [startStepper, isStepping, Stepper] = useStepper(chain.id);

  const [dw, setDw] = React.useState('deposit');
  const [inputModal, setInputModal] = React.useState(false);

  function depositWithdraw(deposit: string) {
    setDw(deposit);
    setInputModal(true);
  }

  const closeInputModal = () => {
    setInputModal(false);
  };

  const handleExit = (boost: BoostEntity) => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    steps.push({
      step: 'claim-unstake',
      message: t('Vault-TxnConfirm', { type: t('Claim-Unstake-noun') }),
      action: walletActions.exitBoost(boost),
      pending: false,
    });

    startStepper(steps);
  };

  const handleClaim = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    steps.push({
      step: 'claim-boost',
      message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
      action: walletActions.claimBoost(boost),
      pending: false,
    });

    startStepper(steps);
  };

  return (
    <div className={classes.containerBoost}>
      <div className={classes.title}>
        <span>{t('Boost-Title')}</span>
        <IconWithBasicTooltip
          title={t('Boost-WhatIs')}
          content={t('Boost-Explain')}
          triggerClass={classes.titleTooltipTrigger}
        />
      </div>
      <div className={classes.boostStats}>
        <div className={classes.boostStat}>
          <div className={classes.boostStatLabel}>
            {t('Boost-Balance', { mooToken: mooToken.symbol })}
          </div>
          <div className={classes.boostStatValue}>{formatBigDecimals(mooTokenBalance, 8)}</div>
        </div>
        <div className={classes.boostStat}>
          <div className={classes.boostStatLabel}>
            {t('Boost-Balance-Staked', { mooToken: mooToken.symbol })}
          </div>
          <div className={classes.boostStatValue}>{formatBigDecimals(boostBalance, 8)}</div>
        </div>
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
            variant="success"
            disabled={isStepping}
          >
            {t('Network-Change', { network: chain.name.toUpperCase() })}
          </Button>
        ) : (
          <>
            <Button
              disabled={isStepping || mooTokenBalance.isZero()}
              className={classes.button}
              onClick={() => depositWithdraw('deposit')}
              fullWidth={true}
              borderless={true}
            >
              {t('Boost-Button-Vault')}
            </Button>
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
            <Button
              disabled={isStepping || boostBalance.isZero()}
              onClick={() => depositWithdraw('unstake')}
              className={classes.button}
              fullWidth={true}
              borderless={true}
            >
              {t('Boost-Button-Unestake')}
            </Button>
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
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={inputModal}
        onClose={() => setInputModal(false)}
      >
        <>
          {dw === 'deposit' ? (
            <Stake closeModal={closeInputModal} boostId={boostId} />
          ) : (
            <Unstake closeModal={closeInputModal} boostId={boostId} />
          )}
        </>
      </Modal>
      <Stepper />
    </div>
  );
}
