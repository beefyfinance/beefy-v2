import { memo, type ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary.tsx';
import { FullscreenTechLoader } from '../TechLoader/TechLoader.tsx';
import { layoutRecipe } from './styles.ts';
import { useTranslation } from 'react-i18next';

export type LayoutProps = {
  header: ReactNode;
  footer: ReactNode;
};

export const Layout = memo<LayoutProps>(function Layout({ header, footer }) {
  const classes = layoutRecipe();
  const { t } = useTranslation();

  return (
    <div className={classes.wrapper}>
      <div className={classes.top}>{header}</div>
      <div className={classes.middle}>
        <ErrorBoundary>
          <Suspense fallback={<FullscreenTechLoader text={t('Vaults-LoadingData')} />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className={classes.bottom}>{footer}</div>
    </div>
  );
});
