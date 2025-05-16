import { css } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { TechLoader } from '../../../../../../components/TechLoader/TechLoader.tsx';
import { getBridgeProviderLogo } from '../../../../../../helpers/bridgeProviderSrc.ts';
import { formatMinutesDuration } from '../../../../../../helpers/date.ts';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import MonetizationOn from '../../../../../../images/icons/mui/MonetizationOn.svg?react';
import Timer from '../../../../../../images/icons/mui/Timer.svg?react';
import { performBridge } from '../../../../../data/actions/bridge.ts';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet.ts';
import {
  selectBridgeConfirmQuote,
  selectBridgeConfirmStatus,
} from '../../../../../data/selectors/bridge.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import { selectTokenPriceByAddress } from '../../../../../data/selectors/tokens.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

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
    return `${formatTokenDisplayCondensed(quote.fee.amount, quote.fee.token.decimals, 6)} ${
      quote.fee.token.symbol
    }`;
  }, [quote.fee]);
  const usdFee = useMemo(() => {
    return formatLargeUsd(quote.fee.amount.multipliedBy(tokenPrice));
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
        <div className={css(styles.step)}>
          <div>
            {t('Bridge-From-Send', {
              amount: formatTokenDisplay(quote.input.amount, quote.input.token.decimals),
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
            <div> {fromChain.name}</div>
          </div>
        </div>
        <div className={css(styles.step, styles.stepBridge)}>
          <div className={classes.via}>{t('Bridge-Via')}</div>
          <div className={classes.provider}>
            <img
              src={getBridgeProviderLogo(quote.config.id)}
              alt={quote.config.title}
              height={24}
              className={classes.providerLogo}
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
        <div className={css(styles.step, styles.stepTo)}>
          <div>
            {t('Bridge-To-Receive', {
              amount: formatTokenDisplay(quote.input.amount, quote.input.token.decimals),
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
            <div> {toChain.name}</div>
          </div>
          {quote.receiver ?
            <>
              <div className={classes.via}>{t('Bridge-At')}</div>
              <div className={classes.receiver}>{quote.receiver}</div>
            </>
          : null}
        </div>
      </div>
      <div className={classes.buttonsContainer}>
        {isWalletConnected ?
          isWalletOnFromChain ?
            <Button
              onClick={handleBridge}
              disabled={isStepping}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Confirm')}
            </Button>
          : <Button
              onClick={handleNetworkChange}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Network-Change', { network: fromChain.name })}
            </Button>

        : <Button
            onClick={handleConnectWallet}
            variant="success"
            fullWidth={true}
            borderless={true}
          >
            {t('Network-ConnectWallet')}
          </Button>
        }
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
