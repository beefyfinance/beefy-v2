import { Box } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { isPending } from '@reduxjs/toolkit';
import clsx from 'clsx';
import { isEqual, sortedUniq, uniq } from 'lodash';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ChainEntity } from '../../features/data/entities/chain';
import {
  dataLoaderActions,
  DataLoaderState,
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

  const rpcErrors = useSelector(
    (state: BeefyState) => findChainIdMatching(state, isRejected),
    stringArrCompare
  );

  const beefyErrors = useSelector(
    (state: BeefyState) => findBeefyApiMatching(state, isRejected),
    stringArrCompare
  );

  const rpcPending = useSelector(
    (state: BeefyState) => findChainIdMatching(state, isPending),
    stringArrCompare
  );

  const beefyPending = useSelector(
    (state: BeefyState) => findBeefyApiMatching(state, isPending),
    stringArrCompare
  );

  const hasAnyError = rpcErrors.length > 0 || beefyErrors.length > 0;
  const hasAnyLoading = rpcPending.length > 0 || beefyPending.length > 0;

  console.log({
    rpcErrors,
    rpcPending,
    globalErrors: beefyErrors,
    globalPending: beefyPending,
    hasAnyError,
    hasAnyLoading,
  });

  // https://github.com/mui/material-ui/issues/17010#issuecomment-615577360
  return (
    <div>
      <Box
        {...({ ref: anchorEl } as any)}
        className={clsx({ [classes.container]: true, open: open })}
        onClick={handleOpen}
      >
        <Box
          className={clsx({
            [classes.circle]: true,
            success: !hasAnyError && !hasAnyLoading,
            warning: hasAnyError,
            loading: hasAnyLoading,
          })}
        ></Box>
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
              {beefyErrors.length > 0 && (
                <Box className={classes.popoverLine}>
                  <Box className={clsx([classes.circle, 'warning', 'circle'])}></Box>
                  <Typography>{t('NetworkStatus-BeefyError')}</Typography>
                </Box>
              )}
              <Typography className={clsx(classes.popoverLine, classes.popoverHelpText)}>
                {t('NetworkStatus-HelpText-Error')}
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

const stringArrCompare = (left: string[], right: string[]) => {
  console.log({ left, right, res: isEqual(sortedUniq(left), sortedUniq(right)) });
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
  if (matcher(state.ui.dataLoader.global.boostForm)) {
    const boost = selectBoostById(state, state.ui.boostModal.boostId);
    chainIds.push(boost.chainId);
  }
  if (matcher(state.ui.dataLoader.global.depositForm)) {
    const vault = selectVaultById(state, state.ui.deposit.vaultId);
    chainIds.push(vault.chainId);
  }
  if (matcher(state.ui.dataLoader.global.withdrawForm)) {
    const vault = selectVaultById(state, state.ui.withdraw.vaultId);
    chainIds.push(vault.chainId);
  }

  return uniq(chainIds);
};

const findBeefyApiMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const matchingKeys: (keyof DataLoaderState['global'])[] = [];
  const beefyKeys: (keyof DataLoaderState['global'])[] = [
    'apy',
    'prices',
    'chainConfig',
    'boosts',
    'vaults',
  ];
  for (const key of beefyKeys) {
    if (matcher(state.ui.dataLoader.global[key])) {
      matchingKeys.push(key);
    }
  }
  return matchingKeys;
};
