import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { confirmBridgeForm } from '../../../../../data/actions/bridge.ts';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import {
  selectBridgeDepositTokenForChainId,
  selectBridgeFormState,
  selectBridgeHasSelectedQuote,
} from '../../../../../data/selectors/bridge.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';
import { AmountSelector } from '../AmountSelector/AmountSelector.tsx';
import { ChainSelector } from '../ChainSelector/ChainSelector.tsx';
import { FormValidator } from '../FormValidator/FormValidator.tsx';
import { QuoteSelector } from '../QuoteSelector/QuoteSelector.tsx';
import { ReceiverSelector } from '../ReceiverSelector/ReceiverSelector.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

function PreviewImpl() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { from, input } = useAppSelector(selectBridgeFormState);
  const currentChainId = useAppSelector(selectCurrentChainId);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnFromChain = currentChainId === from;
  const fromChain = useAppSelector(state => selectChainById(state, from));
  const hasSelectedQuote = useAppSelector(selectBridgeHasSelectedQuote);
  const fromToken = useAppSelector(state => selectBridgeDepositTokenForChainId(state, from));
  const userBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, fromToken.chainId, fromToken.address)
  );
  const isConfirmDisabled = useMemo(() => {
    return !hasSelectedQuote || input.amount.gt(userBalance);
  }, [hasSelectedQuote, input.amount, userBalance]);

  const handleConnectWallet = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  const handleNetworkChange = useCallback(() => {
    dispatch(askForNetworkChange({ chainId: from }));
  }, [dispatch, from]);

  const handleStep = useCallback(() => {
    dispatch(confirmBridgeForm());
  }, [dispatch]);

  return (
    <div className={classes.container}>
      <div className={classes.inputs}>
        <ChainSelector />
        <AmountSelector />
        <ReceiverSelector />
        <FormValidator />
        <QuoteSelector />
      </div>
      <div className={classes.footer}>
        {isWalletConnected ?
          isWalletOnFromChain ?
            <Button
              onClick={handleStep}
              disabled={isConfirmDisabled}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Bridge-Review')}
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
    </div>
  );
}

export const Preview = memo(PreviewImpl);
