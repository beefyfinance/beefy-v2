import { makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AlertWarning } from '../../../Alerts';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';
import { selectBridgeStatus } from '../../../../features/data/selectors/bridge';
import { Title } from '../Title';
import { CloseButton } from '../Content';
import { useBridgeStatus } from './hooks';
import {
  AnySwapLinkButton,
  BridgeSuccesInfo,
  DestChainStatus,
  FromChainStatus,
} from './BridgeInfo';

const useStyles = makeStyles(styles);

export const BridgeContent = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();
  const bridgeStatus = useAppSelector(selectBridgeStatus);
  const txData = useBridgeStatus();

  const title = useMemo(() => {
    if (bridgeStatus === 'success') {
      return 'bridge-Success-Title';
    } else {
      return 'Transactn-ConfirmPending';
    }
  }, [bridgeStatus]);

  return (
    <>
      <Title text={t(title)} />
      {bridgeStatus === 'success' && <BridgeSuccesInfo />}
      {txData?.status === 14 && (
        <AlertWarning className={classes.errorMessage}>{t('Multichain-Error')}</AlertWarning>
      )}
      <FromChainStatus />
      <DestChainStatus txData={txData} />
      <AnySwapLinkButton />
      {bridgeStatus === 'success' && <CloseButton />}
    </>
  );
});
