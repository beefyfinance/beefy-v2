import { Box, Button as MuiButton, CircularProgress, makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { selectChainById } from '../../../../features/data/selectors/chains';
import { selectCurrentChainId } from '../../../../features/data/selectors/wallet';
import { formatBigNumberSignificant } from '../../../../helpers/format';
import { TransactionLink } from '../TransactionLink';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { styles } from './styles';
import {
  selectBridgeState,
  selectBridgeStatus,
  selectBridgeTxData,
} from '../../../../features/data/selectors/bridge';
import { ChainEntity } from '../../../../features/data/entities/chain';
import { Button } from '../../../Button';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';
import { walletActions } from '../../../../features/data/actions/wallet-actions';

const useStyles = makeStyles(styles);

const Chain = memo(({ chain }: { chain: ChainEntity }) => {
  const classes = useStyles();
  return (
    <Box className={classes.chainStatusContainer}>
      <img
        className={classes.icon}
        alt={chain.id}
        src={require(`../../../../images/networks/${chain.id}.svg`).default}
      />
      <div className={classes.chainName}>{chain.name}</div>
    </Box>
  );
});

export const FromChainStatus = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();
  const walletActionsStateResult = useAppSelector(state => state.user.walletActions.result);
  const currentChaindId = useAppSelector(state => selectCurrentChainId(state));
  const chain = useAppSelector(state => selectChainById(state, currentChaindId));

  const StatusIcon = useMemo(() => {
    if (walletActionsStateResult === 'success_pending') {
      return <CircularProgress size={16} />;
    }

    if (walletActionsStateResult === 'success') {
      return (
        <img
          style={{ height: '16px' }}
          alt="check"
          src={require(`../../../../images/icons/check.svg`).default}
        />
      );
    }
  }, [walletActionsStateResult]);

  const text = useMemo(() => {
    if (walletActionsStateResult === 'success_pending') {
      return 'Pending';
    }
    if (walletActionsStateResult === 'success') {
      return 'Success';
    }
  }, [walletActionsStateResult]);

  return (
    <Box className={classes.chainContainer}>
      <Box mb={1} className={classes.statusContainer}>
        <Chain chain={chain} />
        <div className={classes.chainStatusContainer}>
          {StatusIcon}
          <div className={classes.statusText}>{t(text)}</div>
        </div>
      </Box>
      <TransactionLink />
    </Box>
  );
});

export const DestChainStatus = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();
  const bridgeState = useAppSelector(selectBridgeState);
  const destChain = useAppSelector(state => selectChainById(state, bridgeState.destChainId));
  const walletActionsStateResult = useAppSelector(state => state.user.walletActions.result);
  const bridgeStatus = useAppSelector(selectBridgeStatus);
  const txData = useAppSelector(selectBridgeTxData);

  const StatusIcon = useMemo(() => {
    if (bridgeStatus === 'success') {
      return (
        <img
          style={{ height: '16px' }}
          alt="check"
          src={require(`../../../../images/icons/check.svg`).default}
        />
      );
    } else {
      return <CircularProgress size={20} />;
    }
  }, [bridgeStatus]);

  const text = useMemo(() => {
    if (bridgeStatus === 'loading') return 'Pending';
    if (bridgeStatus === 'confirming') return 'Confirming';
    if (bridgeStatus === 'success') return 'Success';
  }, [bridgeStatus]);

  return (
    <Box className={classes.chainContainer}>
      <Box className={classes.statusContainer}>
        <Chain chain={destChain} />
        {walletActionsStateResult === 'success' && (
          <Box className={classes.chainStatusContainer}>
            {StatusIcon}
            <div className={classes.statusText}>{t(text)}</div>
          </Box>
        )}
      </Box>
      {!txData.error && txData.swapTx && (
        <MuiButton
          className={classes.redirectLinkSuccess}
          href={destChain.explorerUrl + '/tx/' + txData.swapTx}
          target="_blank"
        >
          {t('Transactn-View')} {<OpenInNewRoundedIcon htmlColor="#59A662" fontSize="inherit" />}
        </MuiButton>
      )}
    </Box>
  );
});

export const BridgeSuccesInfo = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();

  const bridgeState = useAppSelector(selectBridgeState);
  const destChain = useAppSelector(state => selectChainById(state, bridgeState.destChainId));
  return (
    <div className={classes.successContainer}>
      <div className={classes.textSuccess}>
        {t('Stepper-bridge-Success-Content', {
          amount: formatBigNumberSignificant(bridgeState.amount, 4),
          chain: destChain.name,
        })}
      </div>
    </div>
  );
});

export const AnySwapLinkButton = memo(function ({ hash }: { hash: string }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <MuiButton
      className={classes.redirectLinkSuccess}
      href={`https://anyswap.net/explorer/tx?params=${hash}`}
      target="_blank"
    >
      {t('Transactn-ViewMultichain')}{' '}
      {<OpenInNewRoundedIcon htmlColor="#59A662" fontSize="inherit" />}
    </MuiButton>
  );
});

export const CloseButton = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
    dispatch(walletActions.resetWallet());
  }, [dispatch]);

  return (
    <Button borderless={true} fullWidth={true} className={classes.closeBtn} onClick={handleClose}>
      {t('Transactn-Close')}
    </Button>
  );
});
