import { createGlobLoader } from './globLoader';
import type { BridgeEntity } from '../features/data/entities/bridge';

const iconPathToUrl = import.meta.glob('../images/bridges/*.svg', {
  as: 'url',
  eager: true,
});

const keyToUrl = createGlobLoader(iconPathToUrl);

export function getBridgeIcon(id: BridgeEntity['id']) {
  return keyToUrl(id);
}
