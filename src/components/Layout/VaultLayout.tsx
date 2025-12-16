import { memo, type ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.tsx';
import { FullscreenTechLoader } from '../TechLoader/TechLoader.tsx';
import { styled } from '@repo/styles/jsx';

export type VaultLayoutProps = {
  header: ReactNode;
};

export const VaultLayout = memo<VaultLayoutProps>(function VaultLayout({ header }) {
  return (
    <Wrapper>
      <Top>{header}</Top>
      <Middle>
        <ErrorBoundary>
          <Suspense fallback={<FullscreenTechLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Middle>
    </Wrapper>
  );
});

const Wrapper = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: 'background.body',
  },
});

const Top = styled('div', {
  base: {
    flexShrink: 0,
    backgroundColor: 'background.header',
  },
});

const Middle = styled('div', {
  base: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});
