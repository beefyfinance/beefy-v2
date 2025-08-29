import { lazy, memo, Suspense, useCallback, useRef, useState } from 'react';
import { styled } from '@repo/styles/jsx';
import { NetworkStatus } from '../../../NetworkStatus/NetworkStatus.tsx';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { selectIsStatusIndicatorOpen } from '../../../../features/data/selectors/data-loader-helpers.ts';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import('../WalletContainer/WalletContainer.tsx'));

export const ConnectionStatus = memo(function ConnectionStatus() {
  const [open, setOpen] = useState<boolean>(false);
  const isAutoOpen = useAppSelector(selectIsStatusIndicatorOpen);
  const anchorEl = useRef<HTMLDivElement>(null);

  const handleOpenStatus = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Holder ref={anchorEl} open={open || isAutoOpen}>
      <NetworkStatus
        positionRef={anchorEl}
        isOpen={open}
        onOpen={handleOpenStatus}
        onClose={handleClose}
      />
      <Suspense fallback={<WalletFallback />}>
        <WalletContainer />
      </Suspense>
    </Holder>
  );
});

const WalletFallback = styled('div', {
  base: {
    width: '120px', // address only
  },
});

const Holder = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    backgroundColor: 'background.content.dark',
  },
  variants: {
    open: {
      true: {
        backgroundColor: 'background.content',
      },
    },
  },
});
