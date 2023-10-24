import React, { useCallback } from 'react';
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

const useStyles = makeStyles(styles);

function _Preview() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { from } = useAppSelector(selectBridgeFormState);
  const currentChainId = useAppSelector(selectCurrentChainId);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnFromChain = currentChainId === from;
  const fromChain = useAppSelector(state => selectChainById(state, from));
  const hasSelectedQuote = useAppSelector(selectBridgeHasSelectedQuote);
  const isConfirmDisabled = !hasSelectedQuote;

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

export const Preview = React.memo(_Preview);
