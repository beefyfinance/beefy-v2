import React, { useMemo } from 'react';
import { Button as MuiButton, InputBase, makeStyles, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { selectChainById } from '../../../../features/data/selectors/chains';
import { CardContent } from '../../../../features/vault/components/Card';
import { Fees } from '../Fees';
import { AssetsImage } from '../../../AssetsImage';
import { selectUserBalanceOfToken } from '../../../../features/data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../features/data/selectors/wallet';
import { formatBigDecimals } from '../../../../helpers/format';
import {
  askForNetworkChange,
  askForWalletConnection,
} from '../../../../features/data/actions/wallet';
import { bridgeModalActions } from '../../../../features/data/reducers/wallet/bridge-modal';
import BigNumber from 'bignumber.js';
import { fetchBridgeChainData } from '../../../../features/data/actions/bridge';
import { selectBridgeBifiDestChainData } from '../../../../features/data/selectors/bridge';
import { Divider } from '../../../Divider';
import { useAppDispatch, useAppSelector, useAppStore } from '../../../../store';
import { first } from 'lodash';
import { ChainSelector } from '../ChainSelector';
import { Button } from '../../../Button';
import { styles } from './styles';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { isFulfilled } from '../../../../features/data/reducers/data-loader-types';

const useStyles = makeStyles(styles);

function _Preview({
  handleModal,
  handlePreview,
}: {
  handleModal: () => void;
  handlePreview: () => void;
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const currentChainId = useAppSelector(state => selectCurrentChainId(state));
  const formState = useAppSelector(state => state.ui.bridgeModal);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);

  const isWalletOnFromChain = currentChainId === formState.fromChainId;

  const fromChain = useAppSelector(state => selectChainById(state, formState.fromChainId));

  const destChain = useAppSelector(state => selectChainById(state, formState.destChainId));

  const formDataLoaded = useAppSelector(state =>
    isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  const fromChainData = formState.bridgeDataByChainId[fromChain.id];

  const destChainData = useAppSelector(state =>
    selectBridgeBifiDestChainData(state, fromChain.id, destChain.networkChainId)
  );

  const bifiBalance = useAppSelector(state =>
    isWalletConnected && formDataLoaded && fromChainData
      ? selectUserBalanceOfToken(state, formState.fromChainId, fromChainData.address)
      : new BigNumber(BIG_ZERO)
  );

  const minAmount = destChainData
    ? new BigNumber(destChainData.MinimumSwap)
    : new BigNumber(BIG_ZERO);

  const isDisabled =
    formState.amount.lte(BIG_ZERO) ||
    formState.amount.lt(minAmount) ||
    !formDataLoaded ||
    !destChainData;

  const destChainsList = useMemo(() => {
    const list = {};
    for (const [chainId, name] of Object.entries(formState.supportedChains)) {
      if (chainId !== formState.fromChainId) {
        list[chainId] = name;
      }
    }
    return list;
  }, [formState.fromChainId, formState.supportedChains]);

  const handleNetwork = chainId => {
    if (!formState.bridgeDataByChainId[chainId]) {
      dispatch(fetchBridgeChainData({ chainId: chainId }));
    }
    dispatch(
      bridgeModalActions.setFromChain({
        chainId: chainId,
      })
    );
  };

  const handleDestChain = destChainId => {
    dispatch(
      bridgeModalActions.setDestChain({
        destChainId: destChainId,
      })
    );
    dispatch(
      bridgeModalActions.setInput({
        amount: formState.formattedInput,
        chainId: formState.fromChainId,
        tokenAddress: fromChainData.address,
        state: store.getState(),
      })
    );
  };

  const handleInput = (amountStr: string) => {
    dispatch(
      bridgeModalActions.setInput({
        amount: amountStr,
        chainId: formState.fromChainId,
        tokenAddress: fromChainData.address,
        state: store.getState(),
      })
    );
  };

  const handleMax = () => {
    dispatch(
      bridgeModalActions.setMax({
        chainId: formState.fromChainId,
        tokenAddress: fromChainData.address,
        state: store.getState(),
      })
    );
  };

  const handleConnectWallet = () => {
    handleModal();
    dispatch(askForWalletConnection());
  };

  return (
    <CardContent className={classes.content}>
      {/*From */}
      <div>
        <div className={classes.rowDirectionBalance}>
          <div className={classes.label}>{t('FROM')}</div>
          <div onClick={handleMax} className={classes.balance}>
            {t('Balance')}: <span>{formatBigDecimals(bifiBalance, 4)} BIFI</span>
          </div>
        </div>
        <div className={classes.rowChainInput}>
          <div className={classes.networkPicker}>
            <ChainSelector
              fullWidth={true}
              options={formState.supportedChains}
              value={formState.fromChainId}
              onChange={handleNetwork}
              disabled={!formDataLoaded}
            />
          </div>
          <div className={classes.inputContainer}>
            <Paper component="form">
              <div className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={20} />
              </div>
              <InputBase
                placeholder="0.00"
                value={formState.formattedInput}
                onChange={e => handleInput(e.target.value)}
                disabled={!formDataLoaded}
              />
              <MuiButton onClick={handleMax}>{t('Transact-Max')}</MuiButton>
            </Paper>
          </div>
        </div>
      </div>
      <Divider onClick={() => handleNetwork(formState.destChainId)} />
      {/* To */}
      <div className={classes.toContainer}>
        <div className={classes.rowDirectionBalance}>
          <div className={classes.label}>{t('TO')}</div>
        </div>
        <div className={classes.rowChainInput}>
          <div className={classes.networkPicker}>
            <ChainSelector
              fullWidth={true}
              options={destChainsList}
              value={
                formState.destChainId in destChainsList
                  ? formState.destChainId
                  : first(Object.keys(destChainsList))
              }
              onChange={handleDestChain}
              disabled={!formDataLoaded}
            />
          </div>
          <div className={classes.inputContainer}>
            <Paper component="form">
              <div className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={20} />
              </div>
              <InputBase placeholder="0.00" value={formState.formattedOutput} disabled={true} />
            </Paper>
          </div>
        </div>
      </div>
      {/* Fees */}
      <Fees />
      <div className={classes.buttonContainer}>
        {isWalletConnected ? (
          isWalletOnFromChain ? (
            <Button
              onClick={handlePreview}
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
    </CardContent>
  );
}

export const Preview = React.memo(_Preview);
