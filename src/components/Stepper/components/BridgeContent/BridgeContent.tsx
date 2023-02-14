import { makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../Alerts';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';
import { selectBridgeStatus, selectBridgeTxData } from '../../../../features/data/selectors/bridge';
import { Title } from '../Title';
import { useBridgeStatus } from './hooks';
import {
  AnySwapLinkButton,
  BridgeSuccesInfo,
  DestChainStatus,
  FromChainStatus,
  CloseButton,
} from './BridgeInfo';

const useStyles = makeStyles(styles);

export const BridgeContent = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();
  const bridgeStatus = useAppSelector(selectBridgeStatus);
  const txData = useAppSelector(selectBridgeTxData);
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  useBridgeStatus();

  const isBridgeSuccess = bridgeStatus === 'success';

  const hash =
    walletActionsState.result === 'success'
      ? walletActionsState.data.receipt.transactionHash
      : walletActionsState.result === 'success_pending'
      ? walletActionsState.data.hash
      : '';

  const title = useMemo(() => {
    if (isBridgeSuccess) {
      return 'Stepper-bridge-Success-Title';
    } else {
      return 'Transactn-ConfirmPending';
    }
  }, [isBridgeSuccess]);

  return (
    <>
      <Title text={t(title)} />
      {isBridgeSuccess && <BridgeSuccesInfo />}
      {txData?.status === 14 && (
        <AlertWarning className={classes.errorMessage}>{t('Multichain-Error')}</AlertWarning>
      )}
      <FromChainStatus />
      <DestChainStatus />
      {hash && <AnySwapLinkButton hash={hash} />}
      {isBridgeSuccess && <CloseButton />}
    </>
  );
});
