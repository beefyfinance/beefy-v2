import { createGlobLoader } from './globLoader.ts';
import type { BridgeEntity } from '../features/data/entities/bridge.ts';

const iconPathToUrl = import.meta.glob<string>('../images/icons/*.(svg|png)', {
  query: '?url',
  import: 'default',
  eager: true,
});

const keyToUrl = createGlobLoader(iconPathToUrl);

export function getIcon(id: BridgeEntity['id']) {
  return keyToUrl(id);
}
