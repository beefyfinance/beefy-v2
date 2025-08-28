import { type ReactNode, useEffect, useMemo, useState } from 'react';
import type { MiniAppContextData, MiniAppSdkContext } from './types.ts';
import { sdk } from '@farcaster/miniapp-sdk';
import { MiniAppContext } from './context.ts';
import { useAppDispatch } from '../../features/data/store/hooks.ts';
import { tryToAutoConnectToEip6936Wallet } from '../../features/data/actions/wallet.ts';

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [context, setContext] = useState<MiniAppSdkContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function fetchContext() {
      try {
        return await sdk.context;
      } catch (err) {
        console.error('Error fetching MiniApp context:', err);
        return null;
      }
    }

    async function markReady() {
      try {
        await sdk.actions.ready();
        return true;
      } catch (err) {
        console.error('Error marking MiniApp as ready:', err);
        return false;
      }
    }

    fetchContext()
      .then(sdkContext => {
        if (sdkContext) {
          setContext(sdkContext);
          dispatch(tryToAutoConnectToEip6936Wallet());
          return markReady();
        }
        return false;
      })
      .then(sdkReady => {
        setIsReady(sdkReady);
      })
      .catch(err => {
        console.error('Error in MiniAppProvider effect:', err);
      });
  }, [setContext, setIsReady, dispatch]);

  const data = useMemo((): MiniAppContextData => {
    if (!context) {
      return {
        isInMiniApp: false,
        context: null,
        ready: false,
      };
    }

    return {
      isInMiniApp: true,
      context,
      ready: isReady,
    };
  }, [context, isReady]);

  return <MiniAppContext.Provider value={data}>{children}</MiniAppContext.Provider>;
}
