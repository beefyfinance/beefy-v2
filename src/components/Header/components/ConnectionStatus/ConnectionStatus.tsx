import { lazy, memo, Suspense, useRef, useState } from 'react';
import { styled } from '@repo/styles/jsx';
import { NetworkStatus } from '../../../NetworkStatus/NetworkStatus.tsx';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { selectHaveUnreadStatusNotification } from '../../../../features/data/selectors/data-loader-helpers.ts';

// lazy load web3 related stuff, as libs are quite heavy
const WalletContainer = lazy(() => import('../WalletContainer/WalletContainer.tsx'));

export const ConnectionStatus = memo(function ConnectionStatus() {
  const [open, setOpen] = useState<boolean>(false);
  const haveUnreadNotification = useAppSelector(selectHaveUnreadStatusNotification);
  const anchorEl = useRef<HTMLDivElement>(null);

  return (
    <Holder ref={anchorEl} open={open || haveUnreadNotification}>
      <NetworkStatus
        positionRef={anchorEl}
        isOpen={open}
        setOpen={setOpen}
        haveUnreadNotification={haveUnreadNotification}
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
    flexShrink: 1,
    minWidth: 0,
  },
  variants: {
    open: {
      true: {
        backgroundColor: 'background.content',
      },
    },
  },
});
