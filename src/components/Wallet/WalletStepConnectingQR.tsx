import { styled } from '@repo/styles/jsx';
import { css } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import PlaceholderQRCode from '../../images/wallets/qr-placeholder.svg?react';
import { QRCode } from './QRCode.tsx';
import { LazyImage } from './LazyImage.tsx';
import type { WalletOption } from '../../features/data/apis/wallet/wallet-connection-types.ts';
import type { SelectConnecting } from '../../features/data/reducers/wallet/wallet-types.ts';
import { useCopyToClipboard } from './useCopyToClipboard.ts';
import CopyIcon from '../../images/icons/copy.svg?react';

export const WalletStepConnectingQR = memo(function WalletStepConnectingQR({
  qr,
  wallet,
}: SelectConnecting) {
  return (
    <Layout>
      <div>{qr ? 'Scan the QR code with your wallet app:' : 'Requesting QR code...'}</div>
      <QR url={qr} walletIconUrl={wallet.iconUrl} />
      <div>
        {qr ?
          <CopyUrl url={qr} />
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
    <CopyButton onClick={handleCopy} status={status}>
      <CopyIcon width={16} height={16} fill="currentColor" />
      Copy URL
    </CopyButton>
  );
});

const CopyButton = styled(
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
