import { isMiniAppMessage, isTrustedMiniAppOrigin } from '../../helpers/miniapp.ts';

if (typeof window !== 'undefined') {
  /** @farcaster/miniapp-sdk does not check origin of messages before re-emitting as trusted eip6963:announceProvider event */
  window.addEventListener(
    'message',
    (event: MessageEvent) => {
      if (!isMiniAppMessage(event)) {
        return;
      }

      // stop untrusted reaching other app listeners
      if (!isTrustedMiniAppOrigin(event)) {
        event.stopImmediatePropagation();
        console.warn(`miniapp: dropped message event from untrusted origin ${event.origin}`, event);
      }
    },
    true // capture + registered first: runs before others
  );
}
