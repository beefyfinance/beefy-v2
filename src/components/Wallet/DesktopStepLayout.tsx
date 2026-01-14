import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import type { WalletStepLayoutProps } from './types.ts';
import { Introduction } from './Introduction.tsx';

export const DesktopStepLayout = memo(function DesktopStepLayout({
  content,
  button,
}: WalletStepLayoutProps) {
  return (
    <Layout>
      <Column side="left">
        <Introduction />
        {button && <Footer>{button}</Footer>}
      </Column>
      <Column side="right">{content}</Column>
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    background: 'background.content.darkest',
    borderTopRadius: '8px',
    display: 'flex',
    flexDirection: 'row',
    padding: '16px',
    gap: '12px',
    borderRadius: '16px',
    width: 'container.md',
    maxWidth: '100%',
    maxHeight: 'container.sm',
    minHeight: '360px',
  },
});

const Column = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  variants: {
    side: {
      left: {
        flex: '0 0 25%',
        justifyContent: 'space-between',
      },
      right: {
        flex: '1 1 25%',
      },
    },
  },
});

const Footer = styled('div', {
  base: {
    flex: '0 0 auto',
  },
});
