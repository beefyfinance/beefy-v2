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

    async function hideSplash() {
      try {
        await sdk.actions.ready();
        return true;
      } catch (err) {
        console.error('Error marking MiniApp as ready:', err);
        return false;
      }
    }

    async function askToAdd(sdkContext: MiniAppSdkContext) {
      try {
        const alreadyAdded = sdkContext.client.added || false;
        if (alreadyAdded) {
          console.debug('MiniApp already added');
          return;
        }

        const alreadyAsked = window.localStorage.getItem('miniapp:askedToAdd') === '1';
        if (alreadyAsked) {
          console.debug('Already asked to add MiniApp');
          return;
        }

        // we set flag before asking, so we don't ask at all if set throws and the flag can not be set
        window.localStorage.setItem('miniapp:askedToAdd', '1');

        const result = await sdk.actions.addMiniApp();
        console.debug('Add MiniApp result:', result);
      } catch (err) {
        console.error('Error auto-adding MiniApp:', err);
      }
    }

    async function init() {
      const sdkContext = await fetchContext();
      if (!sdkContext) {
        return;
      }
      setContext(sdkContext);

      dispatch(tryToAutoConnectToEip6936Wallet());

      const sdkReady = await hideSplash();
      if (!sdkReady) {
        return;
      }
      setIsReady(true);

      await askToAdd(sdkContext);
    }

    init().catch(err => {
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
