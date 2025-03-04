import { createGlobLoader } from './globLoader.ts';
import type { BridgeEntity } from '../features/data/entities/bridge.ts';

const iconPathToUrl = import.meta.glob<string>('../images/bridges/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});

const keyToUrl = createGlobLoader(iconPathToUrl);

export function getAssetBridgeIcon(id: BridgeEntity['id']) {
  return keyToUrl(id);
}
