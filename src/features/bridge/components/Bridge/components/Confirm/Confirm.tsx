import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button';
import { formatBigDecimals, formatBigUsd } from '../../../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import {
  selectBridgeConfirmQuote,
  selectBridgeConfirmStatus,
} from '../../../../../data/selectors/bridge';
import { selectChainById } from '../../../../../data/selectors/chains';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import { styles } from './styles';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { performBridge } from '../../../../../data/actions/bridge';
import { AlertError } from '../../../../../../components/Alerts';
import { TechLoader } from '../../../../../../components/TechLoader';
import clsx from 'clsx';
import { getBridgeProviderLogo } from '../../../../../../helpers/bridgeProviderSrc';
import { MonetizationOn, Timer } from '@material-ui/icons';
import { formatMinutesDuration } from '../../../../../../helpers/date';
import { selectTokenPriceByAddress } from '../../../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

const ConfirmLoading = memo(function ConfirmLoading() {
  return <TechLoader />;
});

const ConfirmError = memo(function ConfirmError() {
  const { t } = useTranslation();
  return <AlertError>{t('Bridge-Confirm-Error')}</AlertError>;
});

const ConfirmReady = memo(function ConfirmReady() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const quote = useAppSelector(selectBridgeConfirmQuote);
  const fromChain = useAppSelector(state => selectChainById(state, quote.input.token.chainId));
  const toChain = useAppSelector(state => selectChainById(state, quote.output.token.chainId));
  const currentChainId = useAppSelector(selectCurrentChainId);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnFromChain = currentChainId === fromChain.id;
  const isStepping = useAppSelector(selectIsStepperStepping);
  const timeEstimate = useMemo(() => {
    return formatMinutesDuration(quote.timeEstimate);
  }, [quote.timeEstimate]);
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, quote.fee.token.chainId, quote.fee.token.address)
  );
  const fee = useMemo(() => {
    return `${formatBigDecimals(quote.fee.amount, 4)} ${quote.fee.token.symbol}`;
  }, [quote.fee]);
  const usdFee = useMemo(() => {
    return formatBigUsd(quote.fee.amount.multipliedBy(tokenPrice));
  }, [tokenPrice, quote.fee.amount]);

  const handleBridge = useCallback(() => {
    dispatch(performBridge({ t }));
  }, [dispatch, t]);

  const handleConnectWallet = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  const handleNetworkChange = useCallback(() => {
    dispatch(askForNetworkChange({ chainId: fromChain.id }));
  }, [dispatch, fromChain]);

  return (
    <>
      <div className={classes.steps}>
        <div className={clsx(classes.step, classes.stepFrom)}>
          <div className={classes.tokenAmount}>
            {t('Bridge-From-Send', {
              amount: formatBigDecimals(quote.input.amount, quote.input.token.decimals),
              token: quote.input.token.symbol,
            })}
          </div>
          <div className={classes.via}>{t('Bridge-On')}</div>
          <div className={classes.network}>
            <img
              className={classes.networkIcon}
              width={20}
              height={20}
              alt={fromChain.name}
              src={getNetworkSrc(fromChain.id)}
            />
            <div className={classes.networkName}> {fromChain.name}</div>
          </div>
        </div>
        <div className={clsx(classes.step, classes.stepBridge)}>
          <div className={classes.via}>{t('Bridge-Via')}</div>
          <div className={classes.provider}>
            <img
              src={getBridgeProviderLogo(quote.config.id)}
              alt={quote.config.title}
              height={24}
            />
          </div>
          <div className={classes.providerDetails}>
            <div className={classes.fee}>
              <MonetizationOn className={classes.feeIcon} />
              <div>
                ~{fee} ({usdFee})
              </div>
            </div>
            <div className={classes.time}>
              <Timer className={classes.timeIcon} />
              <div>~{timeEstimate}</div>
            </div>
          </div>
        </div>
        <div className={clsx(classes.step, classes.stepTo)}>
          <div className={classes.tokenAmount}>
            {t('Bridge-To-Receive', {
              amount: formatBigDecimals(quote.input.amount, quote.input.token.decimals),
              token: quote.input.token.symbol,
            })}
          </div>
          <div className={classes.via}>{t('Bridge-On')}</div>
          <div className={classes.network}>
            <img
              className={classes.networkIcon}
              width={20}
              height={20}
              alt={toChain.name}
              src={getNetworkSrc(toChain.id)}
            />
            <div className={classes.networkName}> {toChain.name}</div>
          </div>
        </div>
      </div>
      <div className={classes.buttonsContainer}>
        {isWalletConnected ? (
          isWalletOnFromChain ? (
            <Button
              onClick={handleBridge}
              disabled={isStepping}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Confirm')}
            </Button>
          ) : (
            <Button
              onClick={handleNetworkChange}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Network-Change', { network: fromChain.name })}
            </Button>
          )
        ) : (
          <Button
            onClick={handleConnectWallet}
            variant="success"
            fullWidth={true}
            borderless={true}
          >
            {t('Network-ConnectWallet')}
          </Button>
        )}
      </div>
    </>
  );
});

export const Confirm = memo(function Confirm() {
  const status = useAppSelector(selectBridgeConfirmStatus);

  if (status === 'pending') {
    return <ConfirmLoading />;
  } else if (status === 'fulfilled') {
    return <ConfirmReady />;
  } else {
    return <ConfirmError />;
  }
});
