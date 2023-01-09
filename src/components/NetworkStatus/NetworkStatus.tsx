import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { isEqual, sortedUniq, uniq } from 'lodash';
import React, { memo, useCallback, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ChainEntity } from '../../features/data/entities/chain';
import { dataLoaderActions } from '../../features/data/reducers/data-loader';
import { selectBoostById } from '../../features/data/selectors/boosts';
import { BeefyState } from '../../redux-types';
import { styles } from './styles';
import { Floating } from '../Floating';
import { useAppDispatch, useAppSelector } from '../../store';
import CloseIcon from '@material-ui/icons/Close';
import {
  DataLoaderState,
  isPending,
  isRejected,
  LoaderState,
} from '../../features/data/reducers/data-loader-types';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';
import { selectChainById } from '../../features/data/selectors/chains';

const useStyles = makeStyles(styles);

const ActiveChain = ({ chainId }: { chainId: string | null }) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.line} />
      <div className={classes.chain} style={{ textDecoration: 'none' }}>
        <img
          alt={chainId}
          src={
            chainId
              ? require(`../../images/networks/${chainId}.svg`).default
              : require('../../images/icons/navigation/unsuported-chain.svg').default
          }
        />
      </div>
    </>
  );
};

export function NetworkStatus() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const anchorEl = useRef();
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
      <button
        ref={anchorEl}
        className={clsx({ [classes.container]: true, open: open })}
        onClick={handleToggle}
      >
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
        placement="bottom-start"
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
}

const ConnectedChain = memo(function ({ chainId }: { chainId: ChainEntity['id'] }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <>
      <img alt={chainId} src={require(`../../images/networks/${chainId}.svg`).default} />
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

  if (matcher(state.ui.dataLoader.global.boostForm) && state.ui.boost.boostId) {
    const boost = selectBoostById(state, state.ui.boost.boostId);
    chainIds.push(boost.chainId);
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
