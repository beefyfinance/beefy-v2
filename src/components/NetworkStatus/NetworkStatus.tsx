import { styled } from '@repo/styles/jsx';
import { isEqual, sortedUniq, uniq } from 'lodash-es';
import { memo, type RefObject, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import type {
  DataLoaderState,
  LoaderState,
} from '../../features/data/reducers/data-loader-types.ts';
import { dataLoaderActions } from '../../features/data/reducers/data-loader.ts';
import { selectAllChainIds, selectEolChainIds } from '../../features/data/selectors/chains.ts';
import {
  isLoaderPending,
  isLoaderRejected,
} from '../../features/data/selectors/data-loader-helpers.ts';
import { selectWalletAddressIfKnown } from '../../features/data/selectors/wallet.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { PulseHighlight } from '../../features/vault/components/PulseHighlight/PulseHighlight.tsx';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { entries } from '../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { DropdownContent } from '../Dropdown/DropdownContent.tsx';
import { DropdownProvider } from '../Dropdown/DropdownProvider.tsx';
import { DropdownTrigger } from '../Dropdown/DropdownTrigger.tsx';
import { styles } from './styles.ts';
import { RpcSettingsPanel } from '../Header/components/UserSettings/RpcSettingsPanel.tsx';
import { Button } from '../Button/Button.tsx';
import ArrowExpand from '../../images/icons/arrow-expand.svg?react';
import { ChainIcon } from '../ChainIcon/ChainIcon.tsx';
import { selectChainById } from '../../features/data/selectors/chains.ts';

const useStyles = legacyMakeStyles(styles);

export const NetworkStatus = memo(function NetworkStatus({
  anchorEl,
  isOpen: isUserOpen,
  onOpen,
  onClose,
}: {
  anchorEl: RefObject<HTMLElement>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const isAutoOpen = useAppSelector(state => state.ui.dataLoader.statusIndicator.open);
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const open = isUserOpen || isAutoOpen;
  const handleClose = useCallback(() => {
    if (isAutoOpen) {
      dispatch(dataLoaderActions.closeIndicator());
    }
    onClose();
  }, [dispatch, onClose, isAutoOpen]);

  const handleToggle = useCallback(() => {
    if (open) {
      handleClose();
    } else {
      onOpen();
    }
  }, [open, handleClose, onOpen]);

  const setOpen = useCallback(
    (shouldOpen: boolean) =>
      dispatch(shouldOpen ? dataLoaderActions.openIndicator() : dataLoaderActions.closeIndicator()),
    [dispatch]
  );

  const rpcErrors = useNetStatus<ChainEntity['id'][]>(findChainIdMatching, isLoaderRejected);
  const rpcPending = useNetStatus<ChainEntity['id'][]>(findChainIdMatching, isLoaderPending);
  const beefyErrors = useNetStatus(findBeefyApiMatching, isLoaderRejected);
  const beefyPending = useNetStatus(findBeefyApiMatching, isLoaderPending);
  const configErrors = useNetStatus(findConfigMatching, isLoaderRejected);
  const configPending = useNetStatus(findConfigMatching, isLoaderPending);

  const hasAnyError = rpcErrors.length > 0 || beefyErrors.length > 0 || configErrors.length > 0;
  const hasAnyLoading =
    rpcPending.length > 0 || beefyPending.length > 0 || configPending.length > 0;

  const variant = useMemo(
    () =>
      !hasAnyError && !hasAnyLoading ? 'success'
      : hasAnyError ? 'warning'
      : 'loading',
    [hasAnyError, hasAnyLoading]
  );

  const hidePulse = useMemo(() => !hasAnyError && !hasAnyLoading, [hasAnyError, hasAnyLoading]);

  const titleText = useMemo(() => {
    // only api error
    if (rpcErrors.length === 0 && beefyErrors.length > 0) {
      return t('NetworkStatus-ApiError');
    }
    // only rpc error
    if (rpcErrors.length > 0 && beefyErrors.length === 0) {
      return t('NetworkStatus-RpcError');
    }

    // both error
    if (rpcErrors.length > 0 && beefyErrors.length > 0) {
      return t('NetworkStatus-Error');
    } else {
      return t('NetworkStatus-Success');
    }
  }, [rpcErrors, beefyErrors, t]);

  return (
    <DropdownProvider
      open={open}
      onChange={setOpen}
      variant="dark"
      placement="bottom-end"
      reference={anchorEl}
      closeOnClickAway={true}
    >
      <DropdownButton onClick={handleToggle}>
        <PulseHighlight variant={variant} state={hidePulse ? 'stopped' : 'playing'} />
      </DropdownButton>
      <DropdownContent css={styles.dropdown} gap="none">
        <div className={classes.titleContainer}>
          <Title variant={hasAnyError ? 'warning' : 'success'}>
            <TextTitle>{titleText}</TextTitle>
            <TextTitle>
              {hasAnyError ? t('NetworkStatus-Data-Error') : t('NetworkStatus-Data-Success')}
            </TextTitle>
          </Title>
        </div>

        {isAutoOpen && !isUserOpen ?
          <PopOutContent setIsPopupOpen={onOpen} rpcErrors={rpcErrors} />
        : <>
            <div className={classes.content}>
              <RpcSettingsPanel rpcErrors={rpcErrors} />
            </div>
            <Footer>{t('RpcModal-EmptyList')}</Footer>
          </>
        }
      </DropdownContent>
    </DropdownProvider>
  );
});

const PopOutContent = function PopOutContent({
  setIsPopupOpen,
  rpcErrors,
}: {
  setIsPopupOpen: (isPopupOpen: boolean) => void;
  rpcErrors: ChainEntity['id'][];
}) {
  const showChainNames = rpcErrors.length > 0 && rpcErrors.length <= 3;
  const showChainsConnectedError = rpcErrors.length > 7;
  const chainIds = useAppSelector(selectAllChainIds);

  // Get chain data for all error chains
  const errorChains = useAppSelector(state =>
    rpcErrors.map(chainId => selectChainById(state, chainId))
  );

  return (
    <PopOutContainer>
      <Chains>
        {rpcErrors.length > 0 ?
          <>
            <ChainNamesContainer>
              {errorChains.map(chain => (
                <ChainNameItem key={chain.id}>
                  <ChainIcon chainId={chain.id} />
                  {showChainNames && <span>{chain.name}</span>}
                </ChainNameItem>
              ))}
            </ChainNamesContainer>
            {showChainsConnectedError && <ChainsConnected>{rpcErrors.length - 7}</ChainsConnected>}
          </>
        : <>
            <ChainsConnected>{chainIds.length}</ChainsConnected>
            <span>Rpc Connected</span>
          </>
        }
      </Chains>
      <Button variant="transparent" onClick={() => setIsPopupOpen(false)}>
        <ArrowExpand />
      </Button>
    </PopOutContainer>
  );
};

const Chains = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
});
const PopOutContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    paddingInline: '12px',
    minWidth: '272px',
  },
});

const Title = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    textStyle: 'body.sm',
    color: 'text.light',
  },
  variants: {
    variant: {
      success: {
        color: 'green.40',
      },
      warning: {
        color: 'orange.40',
      },
    },
  },
  defaultVariants: {
    variant: 'success',
  },
});

const TextTitle = styled('div', {
  base: {
    textStyle: 'inherit',
    color: 'inherit',
  },
});

const Footer = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'text.light',
    padding: '10px 12px 12px 12px',
    textAlign: 'left',
  },
});

const DropdownButton = styled(DropdownTrigger.button, {
  base: {
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    columnGap: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
});

const ChainsConnected = styled('div', {
  base: {
    textStyle: 'subline.xs',
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
    borderRadius: '100%',
    backgroundColor: 'background.content.darkest',
  },
});

const ChainNamesContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

const ChainNameItem = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textStyle: 'body.sm',
    color: 'text.light',
  },
});

function useNetStatus<
  R extends string[],
  S extends (state: BeefyState, matcher: (state: LoaderState) => boolean) => R = (
    state: BeefyState,
    matcher: (state: LoaderState) => boolean
  ) => R,
  M extends (state: LoaderState) => boolean = (state: LoaderState) => boolean,
>(selector: S, matcher: M) {
  return useAppSelector<BeefyState, R>(
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
  const chainsToCheck = entries(state.ui.dataLoader.byChainId).filter(
    ([chainId, _]) => !eolChains.includes(chainId)
  );

  for (const [chainId, loader] of chainsToCheck) {
    if (loader) {
      if (matcher(loader.addressBook) || matcher(loader.contractData)) {
        chainIds.push(chainId);
      }
    }
  }

  if (walletAddress && state.ui.dataLoader.byAddress[walletAddress]) {
    const userDataToCheck = entries(state.ui.dataLoader.byAddress[walletAddress].byChainId).filter(
      ([chainId, _]) => !eolChains.includes(chainId)
    );
    for (const [chainId, loader] of userDataToCheck) {
      if (loader) {
        if (matcher(loader.balance) || matcher(loader.allowance)) {
          chainIds.push(chainId);
        }
      }
    }
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
  const configKeys: (keyof DataLoaderState['global'])[] = ['chainConfig', 'promos', 'vaults'];
  for (const key of configKeys) {
    if (matcher(state.ui.dataLoader.global[key])) {
      matchingKeys.push(key);
    }
  }
  return matchingKeys;
};
