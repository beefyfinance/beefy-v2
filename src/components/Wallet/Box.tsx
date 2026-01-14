import { styled } from '@repo/styles/jsx';
import type { StyledVariantProps } from '@repo/styles/types';
import { memo, type ReactNode } from 'react';
import type { LazyValue } from '../../features/data/apis/wallet/helpers.ts';
import { WalletIcon } from './WalletIcon.tsx';

export type BoxProps = {
  title: string;
  iconUrl?: LazyValue<string>;
  children: ReactNode;
} & StyledVariantProps<typeof Layout> &
  StyledVariantProps<typeof Content>;

export const Box = memo(function Box({
  title,
  iconUrl,
  children,
  variant,
  align,
  noPadding = false,
}: BoxProps) {
  return (
    <Layout variant={variant}>
      <Header>
        {iconUrl && <WalletIcon src={iconUrl} size={18} />}
        <Title>{title}</Title>
      </Header>
      <Content align={align} noPadding={noPadding}>
        {children}
      </Content>
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    flex: '1 1 auto',
    minHeight: 0,
    contain: 'paint',
    width: '100%',
  },
  variants: {
    variant: {
      default: {
        '--shadow-bg': '{colors.background.content.dark}',
        '--header-bg': '{colors.background.content.light}',
        '--content-fg': '{colors.text.light}',
      },
      error: {
        '--shadow-bg': '{colors.indicators.error.bg}',
        '--content-fg': '{colors.indicators.error.fg}',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Header = styled('div', {
  base: {
    backgroundColor: 'var(--header-bg, {colors.background.content.light})',
    width: '100%',
    padding: '12px 16px',
    textStyle: 'body.medium',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
});

const Title = styled('div', {
  base: {
    flex: '1 1 auto',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const Content = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: '1 1 auto',
    minHeight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--content-fg, {colors.text.light})',
    backgroundColor: 'var(--shadow-bg, {colors.background.content.dark})',
  },
  variants: {
    noPadding: {
      false: {
        padding: '12px 16px',
      },
    },
    align: {
      top: {
        justifyContent: 'flex-start',
      },
    },
  },
  defaultVariants: {
    noPadding: false,
  },
});
