import { lazy, memo, Suspense, useCallback, useState } from 'react';
import { styled } from '@repo/styles/jsx';
import { NetworkStatus } from '../../../NetworkStatus/NetworkStatus.tsx';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import('../WalletContainer/WalletContainer.tsx'));

export const ConnectionStatus = memo(function ConnectionStatus() {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenStatus = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Holder open={open}>
      <NetworkStatus isOpen={open} onOpen={handleOpenStatus} onClose={handleClose} />
      <Suspense>
        <WalletContainer />
      </Suspense>
    </Holder>
  );
});

const Holder = styled('div', {
  base: {
    display: 'flex',
    backgroundColor: 'background.content.dark',
    alignItems: 'center',
    borderRadius: '8px',
  },
  variants: {
    open: {
      true: {
        backgroundColor: 'background.content',
      },
    },
  },
});
