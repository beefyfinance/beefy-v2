import { lazy, memo, Suspense, useCallback, useRef, useState } from 'react';
import { styled } from '@repo/styles/jsx';
import { NetworkStatus } from '../../../NetworkStatus/NetworkStatus.tsx';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import('../WalletContainer/WalletContainer.tsx'));

export const ConnectionStatus = memo(function ConnectionStatus() {
  const anchorEl = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenStatus = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Holder ref={anchorEl}>
      <Icons>
        <NetworkStatus
          anchorEl={anchorEl}
          isOpen={open}
          onOpen={handleOpenStatus}
          onClose={handleClose}
        />
      </Icons>
      <Suspense>
        <WalletContainer />
      </Suspense>
    </Holder>
  );
});

const Icons = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: '8px',
    gap: '8px',
  },
});

const Holder = styled('div', {
  base: {
    display: 'flex',
    backgroundColor: 'background.content.dark',
    alignItems: 'center',
    borderRadius: '8px',
  },
});
