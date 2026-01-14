import { styled } from '@repo/styles/jsx';
import { css } from '@repo/styles/css';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import PlaceholderQRCode from '../../images/wallets/qr-placeholder.svg?react';
import { QRCode } from './QRCode.tsx';
import { LazyImage } from './LazyImage.tsx';
import type { WalletOption } from '../../features/data/apis/wallet/wallet-connection-types.ts';
import type { SelectConnecting } from '../../features/data/reducers/wallet/wallet-types.ts';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.ts';
import { useIsMobile } from '../../hooks/useIsMobile.ts';
import CopyIcon from '../../images/icons/copy.svg?react';
import MobileIcon from '../../images/icons/mobile.svg?react';
import QRIcon from '../../images/icons/qr.svg?react';
import { WalletIcon } from './WalletIcon.tsx';

function openDeepLink(url: string) {
  // window.open can leave user at blank page in in-app browser
  if (typeof window !== 'undefined') {
    window.location.href = url;
  } else if (typeof document !== 'undefined') {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_self';
    a.rel = 'noreferrer noopener';
    a.click();
  }
}

export const StepConnectingQR = memo(function StepConnectingQR({ qr, wallet }: SelectConnecting) {
  const isMobileDevice = useIsMobile();
  const openInApp = useMemo(() => {
    if (wallet.ui !== 'qr' || !qr) {
      return undefined;
    }
    let url = isMobileDevice ? wallet.deepLinks?.mobile : wallet.deepLinks?.desktop;
    if (!url) {
      return undefined;
    }
    url = url.replace('{uri}', qr);
    return () => {
      openDeepLink(url);
    };
  }, [wallet, isMobileDevice, qr]);
  const [showCode, setShowCode] = useState(!isMobileDevice);

  const handleToggleShowCode = useCallback(() => {
    setShowCode(value => !value);
  }, []);

  useEffect(() => {
    if (qr && !openInApp) {
      setShowCode(true);
    }
  }, [qr, openInApp, setShowCode]);

  return (
    <Layout>
      {showCode ?
        <>
          <div>{qr ? 'Scan the QR code with your wallet app:' : 'Requesting QR code...'}</div>
          <QR url={qr} walletIconUrl={wallet.iconUrl} />
        </>
      : qr ?
        <div>{'Select an option to continue:'}</div>
      : <>
          <div>{'Creating connection request...'}</div>
          <WalletIcon
            src={wallet.iconUrl}
            background={wallet.iconBackground}
            size={48}
            loading={true}
          />
        </>
      }
      <div>
        {qr ?
          <Actions vertical={!showCode}>
            {openInApp && (
              <ActionButton onClick={openInApp}>
                <MobileIcon className={buttonIconClass} />
                Open in App
              </ActionButton>
            )}
            {!showCode && (
              <ActionButton onClick={handleToggleShowCode}>
                <QRIcon className={buttonIconClass} />
                Show QR Code
              </ActionButton>
            )}
            <CopyUrl url={qr} />
          </Actions>
        : 'Please wait...'}
      </div>
    </Layout>
  );
});

const CopyUrl = memo(function CopyUrl({ url }: { url: string }) {
  const { copy, status } = useCopyToClipboard();
  const handleCopy = useCallback(() => {
    copy(url);
  }, [copy, url]);

  return (
    <ActionButton onClick={handleCopy} status={status} disabled={status === 'pending'}>
      <CopyIcon className={buttonIconClass} />
      Copy URL
    </ActionButton>
  );
});

const buttonIconClass = css({
  width: '16px',
  height: '16px',
  flexShrink: 0,
  fill: 'currentColor',
});

const Actions = styled('div', {
  base: {
    display: 'flex',
    gap: '6px 12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  variants: {
    vertical: {
      true: {
        flexDirection: 'column',
        alignItems: 'center',
      },
    },
  },
});

const ActionButton = styled(
  'button',
  {
    base: {
      color: 'text.middle',
      display: 'flex',
      gap: '4px',
      cursor: 'pointer',
    },
    variants: {
      status: {
        idle: {},
        pending: {},
        success: { color: 'indicators.success.fg' },
        error: { color: 'indicators.error.fg' },
      },
    },
  },
  { defaultProps: { type: 'button' } }
);

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    flex: '0 1 auto',
    minHeight: '0',
  },
});

const Background = styled('div', {
  base: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    userSelect: 'none',
    pointerEvents: 'none',
    height: '300px',
    maxWidth: '100%',
    maxHeight: '100%',
    aspectRatio: '1',
    flex: '0 1 auto',
    position: 'relative',
  },
});

const Stacked = styled('div', {
  base: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
});

const qrCodeClass = css({
  width: '100%',
  height: '100%',
  aspectRatio: '1',
});

const qrWalletClass = css({
  width: '50%',
  height: '50%',
  display: 'block',
  objectFit: 'scale-down',
});

const Layer = styled('div', {
  base: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.3s linear',
  },
  variants: {
    visible: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0,
      },
    },
  },
});

export type QRProps = {
  url?: string;
  walletIconUrl: WalletOption['iconUrl'];
};

const QR = memo(function QR({ url, walletIconUrl }: QRProps) {
  return (
    <Background>
      <Stacked>
        <Layer visible={!url}>
          <PlaceholderQRCode className={qrCodeClass} />
        </Layer>
        <Layer visible={!!url}>{url && <QRCode className={qrCodeClass} url={url} />}</Layer>
        <Layer visible={!url}>
          <LazyImage src={walletIconUrl} className={qrWalletClass} />
        </Layer>
      </Stacked>
    </Background>
  );
});
