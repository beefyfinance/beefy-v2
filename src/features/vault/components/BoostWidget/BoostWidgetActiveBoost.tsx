import React from 'react';
import { Box, Button, makeStyles, Typography, Grid, Modal } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { styles } from './styles';
import { Popover } from '../../../../components/Popover/Popover';
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
import { selectTokenById } from '../../../data/selectors/tokens';
import {
  selectBoostRewardsTokenEntity,
  selectBoostUserBalanceInToken,
  selectBoostUserRewardsInToken,
  selectWalletBalanceOfToken,
} from '../../../data/selectors/balance';
import { StakeCountdown } from './StakeCountdown';

const useStyles = makeStyles(styles as any);

export function BoostWidgetActiveBoost({ boostId }: { boostId: BoostEntity['id'] }) {
  const boost = useSelector((state: BeefyState) => selectBoostById(state, boostId));
  const vault = useSelector((state: BeefyState) => selectVaultById(state, boost.vaultId));
  const isBoosted = true;

  const mooToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.earnedTokenId)
  );
  const rewardToken = useSelector((state: BeefyState) =>
    selectBoostRewardsTokenEntity(state, boost.id)
  );

  const mooTokenBalance = useSelector((state: BeefyState) =>
    selectWalletBalanceOfToken(state, boost.chainId, vault.earnedTokenId)
  );
  const boostBalance = useSelector((state: BeefyState) =>
    selectBoostUserBalanceInToken(state, boost.id)
  );
  const boostPendingRewards = useSelector((state: BeefyState) =>
    selectBoostUserRewardsInToken(state, boost.id)
  );

  const periodFinish = useSelector((state: BeefyState) => selectBoostPeriodFinish(state, boost.id));

  const classes = useStyles({ isBoosted });
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === boost.chainId
  );

  const [startStepper, isStepping, Stepper] = useStepper(vault.id, () => {});

  const [dw, setDw] = React.useState('deposit');
  const [inputModal, setInputModal] = React.useState(false);
  function depositWithdraw(deposit: string) {
    setDw(deposit);
    setInputModal(true);
  }

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
    <div className={classes.container}>
      <Box display="flex" alignItems="center">
        <img
          alt="fire"
          src={require(`../../../../images/fire.png`).default}
          className={classes.boostImg}
        />
        <Typography className={classes.h1}>{t('Boost-Noun')}</Typography>
        <Box style={{ marginLeft: '8px' }}>
          <Popover
            title={t('Boost-WhatIs')}
            content={t('Boost-Explain')}
            size="md"
            placement="top-end"
          />
        </Box>
      </Box>
      <Grid container>
        <Grid item xs={6}>
          <Typography className={classes.body1}>
            {t('Boost-Balance', { mooToken: mooToken.symbol })}
          </Typography>
          <Typography className={classes.h2}>{formatBigDecimals(mooTokenBalance, 8)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.body1}>
            {t('Boost-Balance-Staked', { mooToken: mooToken.symbol })}
          </Typography>
          <Typography className={classes.h2}>{formatBigDecimals(boostBalance, 8)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.body1}>{t('Boost-Rewards')}</Typography>
          <Typography className={classes.h2}>
            {formatBigDecimals(boostPendingRewards, 8)} {rewardToken.symbol}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.body1}>{t('Boost-Ends')}</Typography>
          <Typography className={classes.countDown}>
            <StakeCountdown periodFinish={periodFinish} />
          </Typography>
        </Grid>
      </Grid>

      <Button
        disabled={isStepping}
        className={classes.button}
        onClick={() => depositWithdraw('deposit')}
        fullWidth={true}
      >
        {t('Boost-Button-Vault')}
      </Button>
      <Button
        disabled={isStepping}
        className={classes.button}
        onClick={handleClaim}
        fullWidth={true}
      >
        {t('Boost-Button-Withdraw')}
      </Button>
      <Button
        disabled={isStepping}
        className={classes.button}
        onClick={() => handleExit(boost)}
        fullWidth={true}
      >
        {t('Boost-Button-Claim-Unstake')}
      </Button>
      <Button
        disabled={isStepping}
        onClick={() => depositWithdraw('unstake')}
        className={classes.button}
        fullWidth={true}
      >
        {t('Boost-Button-Unestake')}
      </Button>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={inputModal}
        onClose={() => setInputModal(false)}
      >
        <>
          {dw === 'deposit'
            ? /*<Stake
              closeModal={closeInputModal}
              item={item}
              balance={state}
              handleWalletConnect={handleWalletConnect}
              formData={formData}
              setFormData={setFormData}
              resetFormData={resetFormData}
            />*/ null
            : /*
            <Unstake
              closeModal={closeInputModal}
              item={item}
              balance={state}
              handleWalletConnect={handleWalletConnect}
              formData={formData}
              setFormData={setFormData}
              resetFormData={resetFormData}
            />*/ null}
        </>
      </Modal>
      <Stepper />
    </div>
  );
}
