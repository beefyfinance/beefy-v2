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
} from '../../../features/data/selectors/wallet';
import { BIG_ZERO, formatBigDecimals } from '../../../helpers/format';
import { askForNetworkChange, askForWalletConnection } from '../../../features/data/actions/wallet';
import { bridgeModalActions } from '../../../features/data/reducers/wallet/bridge-modal';
import { selectIsAddressBookLoaded } from '../../../features/data/selectors/data-loader';
import { isFulfilled } from '../../../features/data/reducers/data-loader';
import BigNumber from 'bignumber.js';
import { fetchBridgeChainData } from '../../../features/data/actions/bridge';
import { selectBifiDestChainData } from '../../../features/data/selectors/bridge';

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
  const dispatch = useDispatch();
  const store = useStore();
  const currentChainId = useSelector((state: BeefyState) => selectCurrentChainId(state));
  const formState = useSelector((state: BeefyState) => state.ui.bridgeModal);
  const isWalletConnected = useSelector(selectIsWalletConnected);

  const isWalletOnFromChain = currentChainId === formState.fromChainId;

  const fromChain = useSelector((state: BeefyState) =>
    selectChainById(state, formState.fromChainId)
  );

  const destChain = useSelector((state: BeefyState) =>
    selectChainById(state, formState.destChainId)
  );

  const formDataLoaded = useSelector(
    (state: BeefyState) =>
      selectIsAddressBookLoaded(state, currentChainId) &&
      isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  const bifiBalance = useSelector((state: BeefyState) =>
    isWalletConnected && formDataLoaded
      ? selectUserBalanceOfToken(state, formState.fromChainId, formState.destChainInfo.address)
      : new BigNumber(BIG_ZERO)
  );

  const destChainData = useSelector((state: BeefyState) =>
    selectBifiDestChainData(state, destChain.networkChainId)
  );

  const minAmount = destChainData
    ? new BigNumber(destChainData.MinimumSwap)
    : new BigNumber(BIG_ZERO);

  const isDisabled =
    formState.amount.lte(BIG_ZERO) ||
    formState.amount.lt(minAmount) ||
    !formDataLoaded ||
    !destChainData;

  const chains = useSelector(selectAllChains);
  const [chainList, destChainsList] = useMemo(() => {
    const list = {};
    const list2 = {};
    for (const chain of chains) {
      list[chain.id] = chain.name;

      if (chain.id !== formState.fromChainId) {
        list2[chain.id] = chain.name;
      }
    }
    return [list, list2];
  }, [chains, formState.fromChainId]);

  const selectedRenderer = network => {
    return (
      <Box className={classes.networkPickerContainer}>
        <img src={require(`../../../images/networks/${network}.svg`).default} alt={network} />{' '}
        <Typography className={classes.networkValue}>{chainList[network]}</Typography>
      </Box>
    );
  };

  const handleNetwork = chainId => {
    dispatch(
      bridgeModalActions.setFromChain({
        chainId: chainId,
      })
    );

    dispatch(fetchBridgeChainData({ chainId: chainId }));
  };

  const handleDestChain = destChainId => {
    dispatch(
      bridgeModalActions.setDestChain({
        destChainId: destChainId,
      })
    );
  };

  const handleInput = (amountStr: string) => {
    dispatch(
      bridgeModalActions.setInput({
        amount: amountStr,
        chainId: formState.fromChainId,
        tokenAddress: formState.destChainInfo.address,
        state: store.getState(),
      })
    );
  };

  const handleMax = () => {
    dispatch(
      bridgeModalActions.setMax({
        chainId: formState.fromChainId,
        tokenAddress: formState.destChainInfo.address,
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
              selected={formState.fromChainId}
              handler={handleNetwork}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
              disabled={!formDataLoaded}
            />
          </Box>
          <Box className={classes.inputContainer}>
            <Paper component="form">
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
              selected={formState.destChainId}
              handler={handleDestChain}
              renderValue={selectedRenderer}
              noBorder={false}
              className={classes.alignDropdown}
              disabled={!formDataLoaded}
            />
          </Box>
          <Box className={classes.inputContainer}>
            <Paper component="form">
              <Box className={classes.inputLogo}>
                <AssetsImage chainId={'56'} assetIds={['BIFI']} size={20} />
              </Box>
              <InputBase placeholder="0.00" value={formState.formattedOutput} disabled={true} />
            </Paper>
          </Box>
        </Box>
      </Box>
      {/* Fees */}
      <Fees />
      <Box mt={4}>
        {isWalletConnected ? (
          isWalletOnFromChain ? (
            <Button onClick={handlePreview} disabled={isDisabled} className={classes.btn}>
              {t('Bridge-Button-1', { network: destChain.name })}
            </Button>
          ) : (
            <Button
              onClick={() => dispatch(askForNetworkChange({ chainId: formState.fromChainId }))}
              className={classes.btn}
            >
              {t('Network-Change', { network: fromChain.name })}
            </Button>
          )
        ) : (
          <Button onClick={handleConnectWallet} className={classes.btn}>
            {t('Network-ConnectWallet')}
          </Button>
        )}
      </Box>
    </CardContent>
  );
}

export const Preview = React.memo(_Preview);
