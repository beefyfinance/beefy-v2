import { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import { selectChainById } from '../../../../../data/selectors/chains';
import {
  selectBridgeDepositTokenForChainId,
  selectBridgeFormState,
  selectBridgeHasSelectedQuote,
} from '../../../../../data/selectors/bridge';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { Button } from '../../../../../../components/Button';
import { ChainSelector } from '../ChainSelector';
import { AmountSelector } from '../AmountSelector';
import { FormValidator } from '../FormValidator';
import { QuoteSelector } from '../QuoteSelector';
import { confirmBridgeForm } from '../../../../../data/actions/bridge';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { ReceiverSelector } from '../ReceiverSelector';

const useStyles = makeStyles(styles);

function _Preview() {
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
        {isWalletConnected ? (
          isWalletOnFromChain ? (
            <Button
              onClick={handleStep}
              disabled={isConfirmDisabled}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Bridge-Review')}
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
    </div>
  );
}

export const Preview = memo(_Preview);
