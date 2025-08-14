import { styled } from '@repo/styles/jsx';
import { isEqual, sortedUniq, uniq } from 'lodash-es';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import type {
  DataLoaderState,
  LoaderState,
} from '../../features/data/reducers/data-loader-types.ts';
import { dataLoaderActions } from '../../features/data/reducers/data-loader.ts';
import { selectEolChainIds } from '../../features/data/selectors/chains.ts';
import {
  isLoaderPending,
  isLoaderRejected,
} from '../../features/data/selectors/data-loader-helpers.ts';
import { selectWalletAddressIfKnown } from '../../features/data/selectors/wallet.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { PulseHighlight } from '../../features/vault/components/PulseHighlight/PulseHighlight.tsx';
import { entries } from '../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { DropdownContent } from '../Dropdown/DropdownContent.tsx';
import { DropdownProvider } from '../Dropdown/DropdownProvider.tsx';
import { DropdownTrigger } from '../Dropdown/DropdownTrigger.tsx';
import { RpcSettingsPanel } from '../Header/components/UserSettings/RpcSettingsPanel.tsx';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';
import type { DropdownOptions } from '../Dropdown/types.ts';
import { TitleComponent } from './Title.tsx';
import { MobileDrawer } from './MobileDrawer.tsx';
import { ErrorPopOut } from './ErrorPopOut.tsx';

export const NetworkStatus = memo(function NetworkStatus({
  isOpen: isUserOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [editChainId, setEditChainId] = useState<ChainEntity['id'] | null>(null);
  const isAutoOpen = useAppSelector(state => state.ui.dataLoader.statusIndicator.open);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const open = useMemo(() => isUserOpen || isAutoOpen, [isUserOpen, isAutoOpen]);

  const isMobile = useBreakpoint({ to: 'xs' });

  const handleClose = useCallback(() => {
    dispatch(dataLoaderActions.closeIndicator());

    onClose();
  }, [dispatch, onClose]);

  const handleToggle = useCallback(() => {
    if (open) {
      handleClose();
      dataLoaderActions.openIndicator();
    } else {
      onOpen();
      dataLoaderActions.closeIndicator();
    }
  }, [open, handleClose, onOpen]);

  const rpcErrors = useNetStatus<ChainEntity['id'][]>(findChainIdMatching, isLoaderRejected);
  const rpcPending = useNetStatus<ChainEntity['id'][]>(findChainIdMatching, isLoaderPending);
  const beefyErrors = useNetStatus(findBeefyApiMatching, isLoaderRejected);
  const beefyPending = useNetStatus(findBeefyApiMatching, isLoaderPending);
  const configErrors = useNetStatus(findConfigMatching, isLoaderRejected);
  const configPending = useNetStatus(findConfigMatching, isLoaderPending);

  const hasAnyError = useMemo(
    () => rpcErrors.length > 0 || beefyErrors.length > 0 || configErrors.length > 0,
    [rpcErrors, beefyErrors, configErrors]
  );
  const hasAnyLoading = useMemo(
    () => rpcPending.length > 0 || beefyPending.length > 0 || configPending.length > 0,
    [rpcPending, beefyPending, configPending]
  );

  const variant = useMemo(() => (hasAnyError ? 'warning' : 'success'), [hasAnyError]);

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

  const openOnHoverProps: DropdownOptions = useMemo(() => {
    if (!isMobile) {
      return {
        openOnHover: true,
        openOnClick: false,
        hoverOpenDelay: 0,
        hoverCloseDelay: 100,
      };
    }

    return {};
  }, [isMobile]);

  const DropdownLayer = useMemo(() => (isMobile ? 0 : 1), [isMobile]);

  return (
    <DropdownProvider
      open={open}
      onChange={handleToggle}
      variant="dark"
      placement="bottom-end"
      layer={DropdownLayer}
      closeOnClickAway={!isMobile}
      {...openOnHoverProps}
    >
      <DropdownButton onClick={handleToggle}>
        <PulseHighlight variant={variant} state={hidePulse ? 'stopped' : 'playing'} />
      </DropdownButton>

      {isMobile ?
        isAutoOpen && !isUserOpen ?
          <StyledDropdownContent gap="none">
            <TitleComponent hasAnyError={hasAnyError} text={titleText} />
            <ErrorPopOut setIsPopupOpen={onOpen} rpcErrors={rpcErrors} />
          </StyledDropdownContent>
        : <MobileDrawer
            open={isAutoOpen && !isUserOpen}
            handleClose={handleClose}
            titleText={titleText}
            editChainId={editChainId}
            setEditChainId={setEditChainId}
            rpcErrors={rpcErrors}
            hasAnyError={hasAnyError}
          />

      : <StyledDropdownContent gap="none">
          <TitleComponent hasAnyError={hasAnyError} text={titleText} />
          {isAutoOpen && !isUserOpen ?
            <ErrorPopOut setIsPopupOpen={onOpen} rpcErrors={rpcErrors} />
          : <>
              <Content>
                <RpcSettingsPanel
                  rpcErrors={rpcErrors}
                  editChainId={editChainId}
                  setEditChainId={setEditChainId}
                />
              </Content>
              <Footer>{t('RpcModal-EmptyList')}</Footer>
            </>
          }
        </StyledDropdownContent>
      }
    </DropdownProvider>
  );
});

const Content = styled('div', {
  base: {
    backgroundColor: 'background.content.dark',
    borderRadius: '8px',
    marginInline: '2px',
  },
});

const Footer = styled('div', {
  base: {
    textStyle: 'body.md',
    color: 'text.middle',
    padding: '10px 12px 12px 12px',
    textAlign: 'left',
  },
});

const DropdownButton = styled(DropdownTrigger.button, {
  base: {
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    paddingInline: '12px',
  },
});

const StyledDropdownContent = styled(DropdownContent, {
  base: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '320px',
    padding: '0px',
    backgroundColor: 'background.content',
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
