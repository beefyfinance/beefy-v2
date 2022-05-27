import React from 'react';
import { makeStyles, Modal } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { styles } from './styles';
import { formatBigDecimals } from '../../../../helpers/format';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { selectVaultById } from '../../../data/selectors/vaults';
import { BeefyState } from '../../../../redux-types';
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
import { IconWithBasicTooltip } from '../../../../components/Tooltip/IconWithBasicTooltip';
import { Button } from '../../../../components/Button';

const useStyles = makeStyles(styles);

export function BoostWidgetActiveBoost({ boostId }: { boostId: BoostEntity['id'] }) {
  const boost = useSelector((state: BeefyState) => selectBoostById(state, boostId));
  const vault = useSelector((state: BeefyState) => selectVaultById(state, boost.vaultId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, boost.chainId));
  const isBoosted = true;

  const mooToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );
  const rewardToken = useSelector((state: BeefyState) =>
    selectBoostRewardsTokenEntity(state, boost.id)
  );

  const mooTokenBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, boost.chainId, vault.earnedTokenAddress)
  );
  const boostBalance = useSelector((state: BeefyState) =>
    selectBoostUserBalanceInToken(state, boost.id)
  );
  const boostPendingRewards = useSelector((state: BeefyState) =>
    selectBoostUserRewardsInToken(state, boost.id)
  );

  const periodFinish = useSelector((state: BeefyState) => selectBoostPeriodFinish(state, boost.id));
  const isPreStake = periodFinish === null;

  const classes = useStyles({ isBoosted });
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isWalletConnected = useSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === boost.chainId
  );

  const [startStepper, isStepping, Stepper] = useStepper(vault.id);

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
      step: 'claim',
      message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
      action: walletActions.claimBoost(boost),
      pending: false,
    });

    startStepper(steps);
  };

  return (
    <div className={classes.containerBoost}>
      <div className={classes.title}>
        <span className={classes.titleIcon}>🔥</span> <span>{t('Boost-Noun')}</span>
        <IconWithBasicTooltip
          title={t('Boost-WhatIs')}
          content={t('Boost-Explain')}
          triggerClass={classes.titleTooltip}
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
