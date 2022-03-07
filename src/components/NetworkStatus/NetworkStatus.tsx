import { Box } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { isEqual, sortedUniq, uniq } from 'lodash';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ChainEntity } from '../../features/data/entities/chain';
import {
  dataLoaderActions,
  DataLoaderState,
  isPending,
  isRejected,
  LoaderState,
} from '../../features/data/reducers/data-loader';
import { selectBoostById } from '../../features/data/selectors/boosts';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { BeefyState } from '../../redux-types';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export function NetworkStatus() {
  const classes = useStyles({});

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const anchorEl = useRef();
  const open = useSelector((state: BeefyState) => state.ui.dataLoader.statusIndicator.open);
  const chainsById = useSelector((state: BeefyState) => state.entities.chains.byId);
  const handleClose = useCallback(() => dispatch(dataLoaderActions.closeIndicator()), [dispatch]);
  const handleOpen = useCallback(() => dispatch(dataLoaderActions.openIndicator()), [dispatch]);

  const rpcErrors = useNetStatus(findChainIdMatching, isRejected);
  const rpcPending = useNetStatus(findChainIdMatching, isPending);
  const beefyErrors = useNetStatus(findBeefyApiMatching, isRejected);
  const beefyPending = useNetStatus(findBeefyApiMatching, isPending);
  const configErrors = useNetStatus(findConfigMatching, isRejected);
  const configPending = useNetStatus(findConfigMatching, isPending);

  const hasAnyError = rpcErrors.length > 0 || beefyErrors.length > 0 || configErrors.length > 0;
  const hasAnyLoading =
    rpcPending.length > 0 || beefyPending.length > 0 || configPending.length > 0;

  const colorClasses = {
    success: !hasAnyError && !hasAnyLoading,
    warning: hasAnyError,
    loading: hasAnyLoading,
    notLoading: !hasAnyLoading,
  };
  const pulseClassName = clsx(classes.pulseCircle, colorClasses);

  // https://github.com/mui/material-ui/issues/17010#issuecomment-615577360
  return (
    <div>
      <Box
        {...({ ref: anchorEl } as any)}
        className={clsx({ [classes.container]: true, open: open })}
        onClick={handleOpen}
      >
        <Box className={clsx(classes.circle, colorClasses)}>
          <Box style={{ animationDelay: '0s' }} className={pulseClassName}></Box>
          <Box style={{ animationDelay: '1s' }} className={pulseClassName}></Box>
          <Box style={{ animationDelay: '2s' }} className={pulseClassName}></Box>
          <Box style={{ animationDelay: '3s' }} className={pulseClassName}></Box>
        </Box>
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl.current}
        onClose={handleClose}
        PaperProps={{ className: classes.popoverPaper }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box className={classes.popoverSpacer}></Box>
        <Box className={classes.popover}>
          <Box className={classes.closeButton} onClick={handleClose}>
            <Box className={classes.X}></Box>
          </Box>
          {hasAnyError ? (
            <>
              <Typography className={classes.popoverTitle}>
                {t('NetworkStatus-Title-RpcError')}
              </Typography>
              {rpcErrors.map(chainId => (
                <Box className={classes.popoverLine}>
                  <Box className={clsx([classes.circle, 'warning', 'circle'])}></Box>
                  <Typography>
                    {t('NetworkStatus-RpcError', { chain: chainsById[chainId].name })}
                  </Typography>
                </Box>
              ))}
              {(beefyErrors.length > 0 || configErrors.length > 0) && (
                <Box className={classes.popoverLine}>
                  <Box className={clsx([classes.circle, 'warning', 'circle'])}></Box>
                  <Typography>{t('NetworkStatus-BeefyError')}</Typography>
                </Box>
              )}
              <Typography className={clsx(classes.popoverLine, classes.popoverHelpText)}>
                {t('NetworkStatus-HelpText-Error')}
              </Typography>
            </>
          ) : hasAnyLoading ? (
            <>
              <Typography className={classes.popoverTitle}>
                {t('NetworkStatus-Title-Loading')}
              </Typography>
            </>
          ) : (
            <>
              <Typography className={classes.popoverTitle}>
                {t('NetworkStatus-Title-OK')}
              </Typography>
            </>
          )}
        </Box>
      </Popover>
    </div>
  );
}

function useNetStatus<
  R extends string[],
  S extends (state: BeefyState, matcher: (state: LoaderState) => boolean) => R,
  M extends (state: LoaderState) => boolean
>(selector: S, matcher: M) {
  return useSelector(
    (state: BeefyState) => selector(state, matcher),
    // since we are returning a new array each time we select
    // use a comparator to avoid useless re-renders
    stringArrCompare
  );
}

const stringArrCompare = (left: string[], right: string[]) => {
  return isEqual(sortedUniq(left), sortedUniq(right));
};

const findChainIdMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const chainIds: ChainEntity['id'][] = [];
  for (const [chainId, loader] of Object.entries(state.ui.dataLoader.byChainId)) {
    if (
      matcher(loader.balance) ||
      matcher(loader.allowance) ||
      matcher(loader.addressBook) ||
      matcher(loader.contractData)
    ) {
      chainIds.push(chainId);
    }
  }
  if (matcher(state.ui.dataLoader.global.boostForm) && state.ui.boostModal.boostId) {
    const boost = selectBoostById(state, state.ui.boostModal.boostId);
    chainIds.push(boost.chainId);
  }
  if (matcher(state.ui.dataLoader.global.depositForm) && state.ui.deposit.vaultId) {
    const vault = selectVaultById(state, state.ui.deposit.vaultId);
    chainIds.push(vault.chainId);
  }
  if (matcher(state.ui.dataLoader.global.withdrawForm) && state.ui.withdraw.vaultId) {
    const vault = selectVaultById(state, state.ui.withdraw.vaultId);
    chainIds.push(vault.chainId);
  }

  return uniq(chainIds);
};

const findBeefyApiMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const matchingKeys: (keyof DataLoaderState['global'])[] = [];
  const beefyKeys: (keyof DataLoaderState['global'])[] = ['apy', 'prices'];
  for (const key of beefyKeys) {
    if (matcher(state.ui.dataLoader.global[key])) {
      matchingKeys.push(key);
    }
  }
  return matchingKeys;
};

const findConfigMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const matchingKeys: (keyof DataLoaderState['global'])[] = [];
  const configKeys: (keyof DataLoaderState['global'])[] = ['chainConfig', 'boosts', 'vaults'];
  for (const key of configKeys) {
    if (matcher(state.ui.dataLoader.global[key])) {
      matchingKeys.push(key);
    }
  }
  return matchingKeys;
};
