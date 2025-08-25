import { styled } from '@repo/styles/jsx';
import { memo, type RefObject, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { dataLoaderActions } from '../../features/data/reducers/data-loader.ts';
import {
  selectBeefyApiKeysWithPendingData,
  selectBeefyApiKeysWithRejectedData,
  selectChainIdsWithPendingData,
  selectChainIdsWithRejectedData,
  selectConfigKeysWithPendingData,
  selectConfigKeysWithRejectedData,
} from '../../features/data/selectors/data-loader-helpers.ts';
import { PulseHighlight } from '../../features/vault/components/PulseHighlight/PulseHighlight.tsx';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { DropdownContent } from '../Dropdown/DropdownContent.tsx';
import { DropdownProvider } from '../Dropdown/DropdownProvider.tsx';
import { DropdownTrigger } from '../Dropdown/DropdownTrigger.tsx';
import { RpcSettingsPanel } from '../Header/components/UserSettings/RpcSettingsPanel.tsx';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';
import { TitleComponent } from './Title.tsx';
import { MobileDrawer } from './MobileDrawer.tsx';
import { ErrorPopOut } from './ErrorPopOut.tsx';

export const NetworkStatus = memo(function NetworkStatus({
  positionRef,
  isOpen: isUserOpen,
  onOpen,
  onClose,
}: {
  positionRef: RefObject<HTMLDivElement>;
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

  const rpcErrors = useAppSelector(state => selectChainIdsWithRejectedData(state));
  const rpcPending = useAppSelector(state => selectChainIdsWithPendingData(state));
  const beefyErrors = useAppSelector(state => selectBeefyApiKeysWithRejectedData(state));
  const beefyPending = useAppSelector(state => selectBeefyApiKeysWithPendingData(state));
  const configErrors = useAppSelector(state => selectConfigKeysWithRejectedData(state));
  const configPending = useAppSelector(state => selectConfigKeysWithPendingData(state));

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

  return (
    <DropdownProvider
      positionReference={positionRef}
      open={open}
      onChange={handleToggle}
      variant="dark"
      placement="bottom-end"
      layer={isMobile ? 0 : 1}
      closeOnClickAway={!isMobile}
      openOnHover={!isMobile}
      openOnClick={isMobile}
    >
      <DropdownButton onClick={handleToggle} open={open}>
        <PulseHighlight variant={variant} state={hidePulse ? 'stopped' : 'playing'} />
      </DropdownButton>

      {isMobile ?
        isAutoOpen && !isUserOpen ?
          <StyledDropdownContent gap="none">
            <TitleComponent hasAnyError={hasAnyError} text={titleText} />
            <ErrorPopOut setIsPopupOpen={onOpen} rpcErrors={rpcErrors} />
          </StyledDropdownContent>
        : <MobileDrawer
            open={open}
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
    borderLeftRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'background.content.dark',
    paddingInline: '12px',
    _hover: {
      backgroundColor: 'background.content',
    },
  },
  variants: {
    open: {
      true: {
        backgroundColor: 'background.content',
      },
    },
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
