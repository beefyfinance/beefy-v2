import React, { useMemo } from 'react';
import { makeStyles, Box, Typography, Button, InputBase, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { selectAllChains } from '../../../features/data/selectors/chains';
import { CardContent } from '../../../features/vault/components/Card/CardContent';
import { Fees } from './Fees';
import { AssetsImage } from '../../AssetsImage';
import { SimpleDropdown } from '../../SimpleDropdown';
import { BeefyState } from '../../../redux-types';
import { selectUserBalanceOfToken } from '../../../features/data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../features/data/selectors/wallet';
import { BIG_ZERO, formatBigDecimals } from '../../../helpers/format';
import { selectBifiBridgeDataByChainId } from '../../../features/data/selectors/bridge';
import { askForNetworkChange, askForWalletConnection } from '../../../features/data/actions/wallet';
import { bridgeModalActions } from '../../../features/data/reducers/wallet/bridge-modal';
import { selectIsAddressBookLoaded } from '../../../features/data/selectors/data-loader';
import { isFulfilled } from '../../../features/data/reducers/data-loader';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(styles as any);

function _Preview({ handlePreview }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useStore();
  const actualChainId = useSelector((state: BeefyState) => selectCurrentChainId(state));
  const formState = useSelector((state: BeefyState) => state.ui.bridgeModal);
  const isWalletConnected = useSelector(selectIsWalletConnected);

  const formDataLoaded = useSelector(
    (state: BeefyState) =>
      selectIsAddressBookLoaded(state, actualChainId) &&
      isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  const selectedToken = useSelector((state: BeefyState) =>
    selectBifiBridgeDataByChainId(state, actualChainId)
  );

  const bifiBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, actualChainId, selectedToken.address)
  );

  const aproxAmount = formState.amount.gt(BIG_ZERO)
    ? formState.amount.minus(new BigNumber(formState.destChainInfo.MinimumSwapFee)).toFixed(4)
    : new BigNumber(BIG_ZERO).toFixed(4);

  const chains = useSelector(selectAllChains);
  const [chainList, destChainsList] = useMemo(() => {
    const list = {};
    const list2 = {};
    for (const chain of chains) {
      list[chain.id] = chain.name;
      if (chain.id !== actualChainId) {
        list2[chain.id] = chain.name;
      }
    }
    return [list, list2];
  }, [actualChainId, chains]);

  const selectedRenderer = network => {
    return (
      <Box className={classes.networkPickerContainer}>
        <img src={require(`../../../images/networks/${network}.svg`).default} alt={network} />{' '}
        <Typography className={classes.networkValue}>{chainList[network]}</Typography>
      </Box>
    );
  };

  const handleNetwork = chainId => {
    dispatch(askForNetworkChange({ chainId: chainId }));
  };

  const handleDestChain = destChainId => {
    dispatch(
      bridgeModalActions.setDestChain({
        chainId: actualChainId,
        destChainId: destChainId,
        state: store.getState(),
      })
    );
  };

  const handleInput = (amountStr: string) => {
    dispatch(
      bridgeModalActions.setInput({
        amount: amountStr,
        chainId: actualChainId,
        tokenAddress: selectedToken.address,
        state: store.getState(),
      })
    );
  };

  const handleMax = () => {
    dispatch(
      bridgeModalActions.setMax({
        chainId: actualChainId,
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
              selected={actualChainId ?? 'bsc'}
              handler={handleNetwork}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
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
              selected={formState.destChain ?? 'fantom'}
              handler={handleDestChain}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
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
          <Button onClick={handlePreview} className={classes.btn}>
            {t('Bridge-Button-1', { network: 'Fantom' })}
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
