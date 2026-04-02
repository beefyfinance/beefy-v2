import { styled } from '@repo/styles/jsx';
import { memo, type RefObject, useCallback } from 'react';
import { dataLoaderActions } from '../../features/data/reducers/data-loader.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { DropdownProvider } from '../Dropdown/DropdownProvider.tsx';
import { DropdownTrigger } from '../Dropdown/DropdownTrigger.tsx';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';
import { selectWalletAddress } from '../../features/data/selectors/wallet.ts';
import { Notification } from './Notification.tsx';
import { Details } from './Details.tsx';
import { StatusIcon } from './StatusIcon.tsx';

type NetworkStatusProps = {
  positionRef: RefObject<HTMLDivElement>;
  isOpen: boolean;
  haveUnreadNotification: boolean;
  setOpen: (open: boolean) => void;
};

export const NetworkStatus = memo(function NetworkStatus({
  positionRef,
  isOpen: isUserOpen,
  setOpen,
  haveUnreadNotification,
}: NetworkStatusProps) {
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector(selectWalletAddress);
  const isMobile = useMediaQuery('(max-width: 768px)', false);
  const open = isUserOpen || haveUnreadNotification;
  const openOnClick = isMobile || haveUnreadNotification;
  const openOnHover = !openOnClick;
  const isNotification = haveUnreadNotification && !isUserOpen;
  const isDetails = open && !isNotification;

  const handleClose = useCallback(() => {
    dispatch(dataLoaderActions.dismissNotification({ walletAddress }));
    setOpen(false);
  }, [dispatch, setOpen, walletAddress]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleChange = useCallback(
    (openNow: boolean) => {
      if (openNow) {
        handleOpen();
      } else {
        handleClose();
      }
    },
    [handleClose, handleOpen]
  );

  return (
    <DropdownProvider
      positionReference={positionRef}
      open={open}
      onChange={handleChange}
      variant="dark"
      placement="bottom-end"
      layer={isMobile ? 0 : 1}
      closeOnClickAway={!isMobile}
      openOnHover={openOnHover}
      openOnClick={openOnClick}
    >
      <DropdownButton onClick={handleOpen} open={open}>
        <StatusIcon />
      </DropdownButton>
      {isNotification && <Notification onOpenDropdown={handleOpen} />}
      {isDetails && <Details onClose={handleClose} isMobile={isMobile} />}
    </DropdownProvider>
  );
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
    flexShrink: 0,
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
