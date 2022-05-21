import React, { useMemo } from 'react';
import { makeStyles, Box, Typography, Button, InputBase, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { selectAllChains, selectChainById } from '../../../features/data/selectors/chains';
import { CardContent } from '../../../features/vault/components/Card/CardContent';
import { Fees } from './Fees';
import { AssetsImage } from '../../AssetsImage';
import { SimpleDropdown } from '../../SimpleDropdown';
import { BeefyState } from '../../../redux-types';
import { selectUserBalanceOfToken } from '../../../features/data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../../features/data/selectors/wallet';
import { BIG_ZERO, formatBigDecimals } from '../../../helpers/format';
import { selectBifiBridgeDataByChainId } from '../../../features/data/selectors/bridge';
import { askForNetworkChange, askForWalletConnection } from '../../../features/data/actions/wallet';
import { bridgeModalActions } from '../../../features/data/reducers/wallet/bridge-modal';
import { selectIsAddressBookLoaded } from '../../../features/data/selectors/data-loader';
import { isFulfilled } from '../../../features/data/reducers/data-loader';
import BigNumber from 'bignumber.js';
import { initBridgeForm } from '../../../features/data/actions/scenarios';

const useStyles = makeStyles(styles as any);

function _Preview({ handlePreview }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useStore();
  const currentChainId = useSelector((state: BeefyState) => selectCurrentChainId(state));
  const formState = useSelector((state: BeefyState) => state.ui.bridgeModal);
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const walletAddress = useSelector((state: BeefyState) =>
    selectIsWalletKnown(state) ? selectWalletAddress(state) : null
  );

  const destChain = useSelector((state: BeefyState) => selectChainById(state, formState.destChain));

  const formDataLoaded = useSelector(
    (state: BeefyState) =>
      selectIsAddressBookLoaded(state, currentChainId) &&
      isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  React.useEffect(() => {
    initBridgeForm(store, walletAddress);
  }, [store, walletAddress]);

  const selectedToken = useSelector((state: BeefyState) =>
    selectBifiBridgeDataByChainId(state, currentChainId ?? 'bsc')
  );

  const bifiBalance = useSelector((state: BeefyState) =>
    isWalletConnected
      ? selectUserBalanceOfToken(state, currentChainId, selectedToken.address)
      : new BigNumber(BIG_ZERO)
  );

  const minAmount = new BigNumber(formState.destChainInfo.MinimumSwap);

  const aproxAmount =
    formState.amount.gt(BIG_ZERO) && formState.amount.gt(minAmount)
      ? formState.amount.minus(new BigNumber(formState.destChainInfo.MinimumSwapFee)).toFixed(4)
      : new BigNumber(BIG_ZERO).toFixed(2);

  const isDisabled =
    formState.amount.isLessThanOrEqualTo(BIG_ZERO) ||
    formState.amount.isLessThanOrEqualTo(minAmount) ||
    !formDataLoaded;

  const chains = useSelector(selectAllChains);
  const [chainList, destChainsList] = useMemo(() => {
    const list = {};
    const list2 = {};
    for (const chain of chains) {
      list[chain.id] = chain.name;
      if (chain.id !== currentChainId) {
        list2[chain.id] = chain.name;
      }
    }
    return [list, list2];
  }, [currentChainId, chains]);

  const selectedRenderer = network => {
    return (
      <Box className={classes.networkPickerContainer}>
        <img src={require(`../../../images/networks/${network}.svg`).default} alt={network} />{' '}
        <Typography className={classes.networkValue}>{chainList[network]}</Typography>
      </Box>
    );
  };

  const handleNetwork = chainId => {
    if (!isWalletConnected) {
      dispatch(askForWalletConnection());
    }
    if (chainId === formState.destChain) {
      dispatch(
        bridgeModalActions.setDestChain({
          chainId: chainId,
          destChainId: currentChainId,
          state: store.getState(),
        })
      );
    }

    dispatch(askForNetworkChange({ chainId: chainId }));
  };

  const handleDestChain = destChainId => {
    dispatch(
      bridgeModalActions.setDestChain({
        chainId: currentChainId,
        destChainId: destChainId,
        state: store.getState(),
      })
    );
  };

  const handleInput = (amountStr: string) => {
    dispatch(
      bridgeModalActions.setInput({
        amount: amountStr,
        chainId: currentChainId,
        tokenAddress: selectedToken.address,
        state: store.getState(),
      })
    );
  };

  const handleMax = () => {
    dispatch(
      bridgeModalActions.setMax({
        chainId: currentChainId,
        tokenAddress: selectedToken.address,
        state: store.getState(),
      })
    );
  };

  return (
    <CardContent className={classes.content}>
      {/*From */}
      <Box>
        <Box mb={1} className={classes.flexContainer}>
          <Typography variant="body2" className={classes.label}>
            {t('FROM')}
          </Typography>
          <Box onClick={handleMax}>
            <Typography className={classes.balance} variant="body2">
              {t('Balance')}: <span>{formatBigDecimals(bifiBalance, 4)} BIFI</span>
            </Typography>
          </Box>
        </Box>
        <Box className={classes.flexContainer}>
          <Box className={classes.networkPicker}>
            <SimpleDropdown
              list={chainList}
              selected={currentChainId ?? 'bsc'}
              handler={handleNetwork}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
              disabled={!formDataLoaded}
            />
          </Box>
          <Box className={classes.inputContainer}>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={20} />
              </Box>
              <InputBase
                placeholder="0.00"
                value={formState.formattedInput}
                onChange={e => handleInput(e.target.value)}
                disabled={!formDataLoaded}
              />
              <Button onClick={handleMax}>{t('Transact-Max')}</Button>
            </Paper>
          </Box>
        </Box>
      </Box>
      <Box className={classes.customDivider}>
        <Box className={classes.line} />
        <img alt="arrowDown" src={require('../../../images/arrowDown.svg').default} />
        <Box className={classes.line} />
      </Box>
      {/* To */}
      <Box mb={3}>
        <Box mb={1} className={classes.flexContainer}>
          <Typography variant="body2" className={classes.label}>
            {t('TO')}
          </Typography>
        </Box>
        <Box className={classes.flexContainer}>
          <Box className={classes.networkPicker}>
            <SimpleDropdown
              list={destChainsList}
              selected={formState.destChain}
              handler={handleDestChain}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
              disabled={!formDataLoaded}
            />
          </Box>
          <Box className={classes.inputContainer}>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={20} />
              </Box>
              <InputBase placeholder="0.00" value={aproxAmount} disabled={true} />
            </Paper>
          </Box>
        </Box>
      </Box>
      {/* Fees */}
      <Fees />
      <Box mt={4}>
        {isWalletConnected ? (
          <Button onClick={handlePreview} disabled={isDisabled} className={classes.btn}>
            {t('Bridge-Button-1', { network: destChain.name })}
          </Button>
        ) : (
          <Button onClick={() => dispatch(askForWalletConnection())} className={classes.btn}>
            {t('Network-ConnectWallet')}
          </Button>
        )}
      </Box>
    </CardContent>
  );
}

export const Preview = React.memo(_Preview);
