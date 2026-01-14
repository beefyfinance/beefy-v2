import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import type { WalletStepLayoutProps } from './types.ts';
import { Introduction } from './Introduction.tsx';

export const MobileStepLayout = memo(function MobileStepLayout({
  content,
  button,
  hideIntroduction = false,
}: WalletStepLayoutProps) {
  return (
    <Layout>
      {!hideIntroduction && <Introduction />}
      {content}
      {button && <Footer>{button}</Footer>}
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    background: 'background.content.darkest',
    borderTopRadius: '8px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh',
    minHeight: 0,
    padding: '16px',
    gap: '12px',
  },
});

const Footer = styled('div', {
  base: {
    flex: '0 0 auto',
  },
});
