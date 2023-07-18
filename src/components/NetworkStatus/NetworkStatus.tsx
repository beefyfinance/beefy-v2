import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { isEqual, sortedUniq, uniq } from 'lodash-es';
import React, { memo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../features/data/entities/chain';
import { dataLoaderActions } from '../../features/data/reducers/data-loader';
import { selectBoostById } from '../../features/data/selectors/boosts';
import type { BeefyState } from '../../redux-types';
import { styles } from './styles';
import { Floating } from '../Floating';
import { useAppDispatch, useAppSelector } from '../../store';
import CloseIcon from '@material-ui/icons/Close';
import type { DataLoaderState, LoaderState } from '../../features/data/reducers/data-loader-types';
import { isPending, isRejected } from '../../features/data/reducers/data-loader-types';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddressIfKnown,
} from '../../features/data/selectors/wallet';
import { selectChainById, selectEolChainIds } from '../../features/data/selectors/chains';
import { getNetworkSrc } from '../../helpers/networkSrc';
import iconUnsupportedChain from '../../images/icons/navigation/unsuported-chain.svg';

const useStyles = makeStyles(styles);
const ActiveChain = ({ chainId }: { chainId: string | null }) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.line} />
      <div className={classes.chain} style={{ textDecoration: 'none' }}>
        <img alt={chainId} src={chainId ? getNetworkSrc(chainId) : iconUnsupportedChain} />
      </div>
    </>
  );
};

export const NetworkStatus = memo(function NetworkStatus({
  anchorEl,
}: {
  anchorEl: React.RefObject<HTMLSelectElement>;
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const open = useAppSelector(state => state.ui.dataLoader.statusIndicator.open);
  const chainsById = useAppSelector(state => state.entities.chains.byId);
  const handleClose = useCallback(() => dispatch(dataLoaderActions.closeIndicator()), [dispatch]);
  const handleToggle = useCallback(
    () => dispatch(open ? dataLoaderActions.closeIndicator() : dataLoaderActions.openIndicator()),
    [dispatch, open]
  );
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const currentChainId = useAppSelector(selectCurrentChainId);

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

  return (
    <>
      <button className={clsx({ [classes.container]: true, open: open })} onClick={handleToggle}>
        <div className={clsx(classes.circle, colorClasses)}>
          <div className={pulseClassName} />
          <div className={pulseClassName} />
          <div className={pulseClassName} />
          <div className={pulseClassName} />
        </div>
        {isWalletConnected && <ActiveChain chainId={currentChainId} />}
      </button>
      <Floating
        open={open}
        placement="bottom-end"
        anchorEl={anchorEl}
        className={classes.dropdown}
        display="flex"
        autoWidth={false}
      >
        <div className={classes.titleContainer}>
          <div className={classes.title}>
            {isWalletConnected ? (
              currentChainId ? (
                <Trans
                  t={t}
                  i18nKey="NetworkStatus-Connected-To"
                  components={{ chain: <ConnectedChain chainId={currentChainId} /> }}
                />
              ) : (
                t('Network-Unsupported')
              )
            ) : (
              t('NetworkStatus-NoWallet')
            )}
          </div>
          <CloseIcon onClick={handleClose} className={classes.cross} />
        </div>
        <div className={classes.content}>
          <div className={classes.contentTitle}>{t('NetworkStatus-Status')}</div>
          {hasAnyError ? (
            <>
              {rpcErrors.map(chainId => (
                <div className={classes.popoverLine} key={chainId}>
                  <div className={clsx([classes.circle, 'warning', 'circle'])} />
                  <div>{t('NetworkStatus-RpcError', { chain: chainsById[chainId].name })}</div>
                </div>
              ))}
              {(beefyErrors.length > 0 || configErrors.length > 0) && (
                <div className={classes.popoverLine}>
                  <div className={clsx([classes.circle, 'warning', 'circle'])} />
                  <div>{t('NetworkStatus-BeefyError')}</div>
                </div>
              )}
              <div className={clsx(classes.popoverLine, classes.popoverHelpText)}>
                {t('NetworkStatus-HelpText-Error')}
              </div>
            </>
          ) : hasAnyLoading ? (
            <>
              <div className={classes.popoverLine}>
                <div className={clsx([classes.circle, 'loading', 'circle'])} />
                {t('NetworkStatus-Title-Loading')}
              </div>
            </>
          ) : (
            <>
              <div className={classes.popoverLine}>
                <div className={clsx([classes.circle, 'success', 'circle'])} />
                {t('NetworkStatus-Title-OK')}
              </div>
            </>
          )}
        </div>
      </Floating>
    </>
  );
});

const ConnectedChain = memo(function ConnectedChain({ chainId }: { chainId: ChainEntity['id'] }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <>
      <img alt={chainId} src={getNetworkSrc(chainId)} />
      {chain.name}
    </>
  );
});

function useNetStatus<
  R extends string[],
  S extends (state: BeefyState, matcher: (state: LoaderState) => boolean) => R,
  M extends (state: LoaderState) => boolean
>(selector: S, matcher: M) {
  return useAppSelector(
    state => selector(state, matcher),
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
  const eolChains = selectEolChainIds(state);
  const walletAddress = selectWalletAddressIfKnown(state);
  const chainsToCheck = Object.entries(state.ui.dataLoader.byChainId).filter(
    ([chainId, _]) => !eolChains.includes(chainId)
  );

  for (const [chainId, loader] of chainsToCheck) {
    if (matcher(loader.addressBook) || matcher(loader.contractData)) {
      chainIds.push(chainId);
    }
  }

  if (walletAddress && state.ui.dataLoader.byAddress[walletAddress]) {
    const userDataToCheck = Object.entries(
      state.ui.dataLoader.byAddress[walletAddress].byChainId
    ).filter(([chainId, _]) => !eolChains.includes(chainId));
    for (const [chainId, loader] of userDataToCheck) {
      if (matcher(loader.balance) || matcher(loader.allowance)) {
        chainIds.push(chainId);
      }
    }
  }

  if (matcher(state.ui.dataLoader.global.boostForm) && state.ui.boost.boostId) {
    const boost = selectBoostById(state, state.ui.boost.boostId);
    chainIds.push(boost.chainId);
  }

  return uniq(chainIds);
};

const findBeefyApiMatching = (state: BeefyState, matcher: (loader: LoaderState) => boolean) => {
  const matchingKeys: (keyof DataLoaderState['global'])[] = [];
  const beefyKeys: (keyof DataLoaderState['global'])[] = ['apy', 'prices', 'analytics'];
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
