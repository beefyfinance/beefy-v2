import { lazy, memo, Suspense, useCallback, useRef, useState } from 'react';
import { styled } from '@repo/styles/jsx';
import { NetworkStatus } from '../../../NetworkStatus/NetworkStatus.tsx';
import { UserSettings } from '../UserSettings/UserSettings.tsx';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import('../WalletContainer/WalletContainer.tsx'));

export const ConnectionStatus = memo(function ConnectionStatus() {
  const anchorEl = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<null | 'rpc' | 'status'>(null);

  const handleOpenRpc = useCallback(() => {
    setOpen('rpc');
  }, [setOpen]);

  const handleOpenStatus = useCallback(() => {
    setOpen('status');
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(null);
  }, [setOpen]);

  return (
    <Holder ref={anchorEl}>
      <Icons>
        <UserSettings
          anchorEl={anchorEl}
          isOpen={open === 'rpc'}
          onOpen={handleOpenRpc}
          onClose={handleClose}
        />
        <NetworkStatus
          anchorEl={anchorEl}
          isOpen={open === 'status'}
          isOtherOpen={open !== null}
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
