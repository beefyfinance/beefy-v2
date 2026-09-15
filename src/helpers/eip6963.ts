import type {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
} from '@web3-onboard/injected-wallets/dist/types';

const PLACEHOLDER_ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NiA5NiI+PHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiByeD0iMjAiIGZpbGw9IiMzZDQ1NTMiLz48cmVjdCB4PSIyMiIgeT0iMzAiIHdpZHRoPSI1MiIgaGVpZ2h0PSIzOCIgcng9IjciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QwZDZkZiIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZD0iTTU4IDQzaDE2djEySDU4YTYgNiAwIDAgMSAwLTEyeiIgZmlsbD0iI2QwZDZkZiIvPjwvc3ZnPg==';

export function isEip6963AnnounceProviderEvent(e: Event): e is EIP6963AnnounceProviderEvent {
  if (e.type !== 'eip6963:announceProvider' || !('detail' in e)) {
    return false;
  }

  const { detail } = e as EIP6963AnnounceProviderEvent;
  if (!detail || typeof detail !== 'object') {
    return false;
  }

  return (
    typeof detail.info?.uuid === 'string' &&
    typeof detail.info?.name === 'string' &&
    typeof detail.info?.rdns === 'string' &&
    typeof detail.info?.icon === 'string' &&
    !!detail.provider &&
    typeof detail.provider === 'object'
  );
}

// Accept only data:image URIs that cannot reach web3-onboard's raw-HTML {@html} branch.
function isSafeIcon(icon: unknown): boolean {
  return (
    typeof icon === 'string' && /^data:image\//i.test(icon) && !icon.toLowerCase().includes('<svg')
  );
}

export function cleanEip6963ProviderDetail(e: EIP6963ProviderDetail): EIP6963ProviderDetail {
  return Object.freeze({
    provider: e.provider,
    info: Object.freeze({
      uuid: e.info.uuid,
      name: e.info.name,
      rdns: e.info.rdns,
      icon: isSafeIcon(e.info.icon) ? e.info.icon : PLACEHOLDER_ICON,
    }),
  });
}
