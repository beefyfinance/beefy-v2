import { createBrowserRouter, createHashRouter, type LoaderFunction } from 'react-router';
import { AppLayout } from './components/AppLayout/AppLayout.tsx';
import { FullscreenTechLoader } from './components/TechLoader/TechLoader.tsx';
import { type ComponentType } from 'react';
import { redirectLoader } from './config/redirects.ts';

const createRouter =
  import.meta.env.VITE_ROUTER === 'browser' ? createBrowserRouter : createHashRouter;

type LazyComponent<T extends ComponentType> = () => Promise<{ default: T }>;

function makeLazy<T extends ComponentType>(
  componentLoader: LazyComponent<T>,
  dataLoader?: LoaderFunction
) {
  return async () => {
    return {
      Component: (await componentLoader()).default,
      loader: dataLoader,
    };
  };
}

export const router = createRouter([
  {
    Component: AppLayout,
    HydrateFallback: FullscreenTechLoader,
    children: [
      {
        index: true,
        lazy: makeLazy(() => import('./features/home/HomePage.tsx')),
      },
      {
        path: ':network?/vault/:id',
        lazy: makeLazy(() => import('./features/vault/VaultPage.tsx')),
      },
      {
        path: 'bridge',
        lazy: makeLazy(() => import('./features/bridge/BridgePage.tsx')),
      },
      {
        path: 'treasury',
        lazy: makeLazy(() => import('./features/treasury/TreasuryPage.tsx')),
      },
      {
        path: 'dashboard',
        children: [
          {
            index: true,
            lazy: makeLazy(() => import('./features/dashboard/DashboardPage.tsx')),
          },
          {
            path: ':address',
            lazy: makeLazy(() => import('./features/dashboard/DashboardAddressPage.tsx')),
          },
        ],
      },
      {
        path: 'campaigns',
        children: [
          {
            path: 'begems',
            lazy: makeLazy(() => import('./features/campaigns/begems/BeGemsPage.tsx')),
          },
        ],
      },
      {
        path: '*',
        lazy: makeLazy(() => import('./features/pagenotfound/NotFoundPage.tsx'), redirectLoader),
      },
    ],
  },
]);
