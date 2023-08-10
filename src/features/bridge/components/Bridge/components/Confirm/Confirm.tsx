import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button';
import { Divider } from '../../../../../../components/Divider';
import { formatAddressShort, formatBigDecimals } from '../../../../../../helpers/format';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import { selectAllowanceByTokenAddress } from '../../../../../data/selectors/allowances';
import {
  selectBridgeConfirmQuote,
  selectBridgeConfirmStatus,
} from '../../../../../data/selectors/bridge';
import { selectChainById } from '../../../../../data/selectors/chains';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddress,
} from '../../../../../data/selectors/wallet';
import { styles } from './styles';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import { stepperActions } from '../../../../../data/reducers/wallet/stepper';
import { startStepper } from '../../../../../data/actions/stepper';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { performBridge } from '../../../../../data/actions/bridge';

const useStyles = makeStyles(styles);

const ConfirmLoading = memo(function () {
  return <div>Loading...</div>;
});

const ConfirmError = memo(function () {
  return <div>Error...</div>;
});

const ConfirmReady = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const quote = useAppSelector(selectBridgeConfirmQuote);
  const fromChain = useAppSelector(state => selectChainById(state, quote.input.token.chainId));
  const toChain = useAppSelector(state => selectChainById(state, quote.output.token.chainId));
  const currentChainId = useAppSelector(selectCurrentChainId);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnFromChain = currentChainId === fromChain.id;
  const walletAddress = useAppSelector(selectWalletAddress);
  const isStepping = useAppSelector(selectIsStepperStepping);

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
      <div className={classes.infoContainer}>
        <div className={classes.transferInfo}>
          <div className={classes.label}>{t('FROM')}</div>
          <div className={classes.networkAmount}>
            <div className={classes.network}>
              <img
                className={classes.networkIcon}
                width={20}
                height={20}
                alt=""
                src={getNetworkSrc(fromChain.id)}
              />
              <div className={classes.networkName}>{fromChain.name}</div>
            </div>
            <div className={classes.amount}>
              <div>
                - {formatBigDecimals(quote.input.amount, quote.input.token.decimals)}{' '}
                {quote.input.token.symbol}
              </div>
              <div>
                - {formatBigDecimals(quote.fee.amount, quote.fee.token.decimals)}{' '}
                {quote.fee.token.symbol}
              </div>
            </div>
          </div>
          <div className={classes.address}>
            {t('Address')}: <span>{formatAddressShort(walletAddress)}</span>
          </div>
        </div>
        <Divider />
        <div className={classes.transferInfo}>
          <div className={classes.label}>{t('TO')}</div>
          <div className={classes.networkAmount}>
            <div className={classes.network}>
              <img
                className={classes.networkIcon}
                width={20}
                height={20}
                alt=""
                src={getNetworkSrc(toChain.id)}
              />
              <div className={classes.networkName}>{toChain.name}</div>
            </div>
            <div className={classes.amount}>
              + {formatBigDecimals(quote.output.amount, quote.output.token.decimals)}{' '}
              {quote.output.token.symbol}
            </div>
          </div>
          <div className={classes.address}>
            {t('Address')}: <span>{formatAddressShort(walletAddress)}</span>
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
