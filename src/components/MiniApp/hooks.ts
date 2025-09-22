import { useCallback, useContext } from 'react';
import { MiniAppContext } from './context.ts';
import { sdk } from '@farcaster/miniapp-sdk';

export function useMiniApp() {
  return useContext(MiniAppContext);
}

export function useIsInMiniApp() {
  const { isInMiniApp } = useMiniApp();
  return isInMiniApp;
}

export function useMiniAppContext() {
  const { context } = useMiniApp();
  return context;
}

export function useOpenExternalUrl() {
  const isInMiniApp = useIsInMiniApp();
  return useCallback(
    (url: string) => {
      if (!isInMiniApp) {
        window.open(url, '_blank', 'noopener');
        return;
      }

      sdk.actions.openUrl(url).catch(() => {
        window.open(url, '_blank', 'noopener');
      });
    },
    [isInMiniApp]
  );
}
