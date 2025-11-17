import type { LazyValue } from '../../features/data/apis/wallet/helpers.ts';
import { styled } from '@repo/styles/jsx';
import { LazyImage } from './LazyImage.tsx';
import { type CSSProperties, memo } from 'react';

export type WalletIconProps = {
  src: LazyValue<string>;
  background?: string;
  size?: number;
  padding?: number;
};

export const WalletIcon = memo(function WalletIcon({
  src,
  background = '#fff',
  size,
  padding,
}: WalletIconProps) {
  return (
    <IconBackground
      style={
        {
          background,
          '--icon-size': size ? `${size}px` : undefined,
          '--icon-padding': padding ? `${padding}px` : undefined,
        } as CSSProperties
      }
    >
      <Icon src={src} style={{ width: size, height: size }} />
    </IconBackground>
  );
});

const IconBackground = styled('div', {
  base: {
    '--icon-padding-x': 'var(--icon-padding, calc(var(--icon-size, 24px) / 6))',
    '--bg-size': 'calc(var(--icon-size, 24px) + var(--icon-padding-x, 4px) * 2)',
    width: 'var(--bg-size, 32px)',
    height: 'var(--bg-size, 32px)',
    padding: 'var(--icon-padding-x, 4px)',
    borderRadius: 'calc(var(--icon-padding-x, 4px) * 1.5)',
    backgroundColor: 'white',
    flex: '0 0 auto',
  },
});

const Icon = styled(
  LazyImage,
  {
    base: {
      width: 'var(--icon-size, 24px)',
      height: 'var(--icon-size, 24px)',
    },
  },
  {
    defaultProps: {
      width: 24,
      height: 24,
      alt: '',
      'aria-hidden': true,
    },
  }
);
