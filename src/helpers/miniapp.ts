import { MINIAPP_HOST_ORIGINS } from '../config/miniapp.ts';

const TRUSTED_MINIAPP_HOST_ORIGINS: ReadonlySet<string> = new Set(MINIAPP_HOST_ORIGINS);
const MESSAGE_TYPES: ReadonlySet<string> = new Set(['frameEvent', 'frameEthProviderEvent']);

export function isMiniAppMessage(event: MessageEvent) {
  const type = event?.data?.type;
  return typeof type === 'string' && MESSAGE_TYPES.has(type);
}

export function isTrustedMiniAppOrigin(event: MessageEvent) {
  // no host
  if (window.parent === window) {
    return false;
  }

  // not from direct host
  if (event.source !== window.parent) {
    return false;
  }

  // only from trusted origin
  return TRUSTED_MINIAPP_HOST_ORIGINS.has(event.origin);
}
