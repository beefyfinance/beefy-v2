import React, { useCallback } from 'react';
import { InputBase, makeStyles, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Fees } from '../Fees';
import { styles } from './styles';
import { useAppDispatch, useAppSelector, useAppStore } from '../../../../../../store';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import { selectChainById } from '../../../../../data/selectors/chains';
import {
  selectBridgeBifiDestChainData,
  selectBridgeState,
} from '../../../../../data/selectors/bridge';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { fetchBridgeChainData } from '../../../../../data/actions/bridge';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { formatBigDecimals } from '../../../../../../helpers/format';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { Divider } from '../../../../../../components/Divider';
import { InputChainAdornment } from '../InputChainAdornment';

import { Button } from '../../../../../../components/Button';
const useStyles = makeStyles(styles);

function _Preview() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const currentChainId = useAppSelector(selectCurrentChainId);
  const formState = useAppSelector(selectBridgeState);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);

  const isWalletOnFromChain = currentChainId === formState.fromChainId;

  const fromChain = useAppSelector(state => selectChainById(state, formState.fromChainId));

  const destChain = useAppSelector(state => selectChainById(state, formState.destChainId));

  const fromChainData = formState.bridgeDataByChainId[fromChain.id];

  const destChainData = useAppSelector(state =>
    selectBridgeBifiDestChainData(state, fromChain.id, destChain.networkChainId)
  );

  const handleStep = useCallback(() => {
    dispatch(bridgeActions.setStep({ step: FormStep.Confirm }));
  }, [dispatch]);

  const bifiBalance = useAppSelector(state =>
    isWalletConnected && fromChainData
      ? selectUserBalanceOfToken(state, formState.fromChainId, fromChainData.address)
      : new BigNumber(BIG_ZERO)
  );

  const minAmount = destChainData
    ? new BigNumber(destChainData.MinimumSwap)
    : new BigNumber(BIG_ZERO);

  const isDisabled =
    formState.amount.lte(BIG_ZERO) || formState.amount.lt(minAmount) || !destChainData;

  const handleNetwork = chainId => {
    if (!formState.bridgeDataByChainId[chainId]) {
      dispatch(fetchBridgeChainData({ chainId: chainId }));
    }
    dispatch(
      bridgeActions.setFromChain({
        chainId: chainId,
      })
    );
  };

  const handleInput = (amountStr: string) => {
    dispatch(
      bridgeActions.setInput({
        amount: amountStr,
        chainId: formState.fromChainId,
        tokenAddress: fromChainData.address,
        state: store.getState(),
      })
    );
  };

  const handleMax = () => {
    dispatch(
      bridgeActions.setMax({
        chainId: formState.fromChainId,
        tokenAddress: fromChainData.address,
        state: store.getState(),
      })
    );
  };

  const handleConnectWallet = () => {
    dispatch(askForWalletConnection());
  };

  return (
    <>
      <div className={classes.infoContainer}>
        {/*From */}
        <div>
          <div className={classes.rowDirectionBalance}>
            <div className={classes.label}>{t('FROM')}</div>
            <div onClick={handleMax} className={classes.balance}>
              {t('Balance')}: <span>{formatBigDecimals(bifiBalance, 4)} BIFI</span>
            </div>
          </div>
          <div className={classes.inputContainer}>
            <Paper component="form">
              <div className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={24} />
              </div>
              <InputBase
                placeholder="0.00"
                value={formState.formattedInput}
                onChange={e => handleInput(e.target.value)}
                endAdornment={
                  <InputChainAdornment chain={fromChain} nextStep={FormStep.SelectFromNetwork} />
                }
              />
            </Paper>
          </div>
        </div>

        <Divider onClick={() => handleNetwork(formState.destChainId)} clickleable={true} />
        {/* To */}
        <div className={classes.toContainer}>
          <div className={classes.rowDirectionBalance}>
            <div className={classes.label}>{t('TO')}</div>
          </div>

          <div className={classes.inputContainer}>
            <Paper component="form">
              <div className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={24} />
              </div>
              <InputBase
                placeholder="0.00"
                value={formState.formattedOutput}
                disabled={true}
                endAdornment={
                  <InputChainAdornment chain={destChain} nextStep={FormStep.SelectToNetwork} />
                }
              />
            </Paper>
          </div>
        </div>

        {/* Fees */}
        <Fees />
      </div>
      <div className={classes.buttonContainer}>
        {isWalletConnected ? (
          isWalletOnFromChain ? (
            <Button
              onClick={handleStep}
              disabled={isDisabled}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Bridge-Button-1', { network: destChain.name })}
            </Button>
          ) : (
            <Button
              onClick={() => dispatch(askForNetworkChange({ chainId: formState.fromChainId }))}
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
}

export const Preview = React.memo(_Preview);
