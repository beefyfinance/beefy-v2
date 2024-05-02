import { createGlobLoader } from './globLoader';
import type { BridgeEntity } from '../features/data/entities/bridge';

const iconPathToUrl = import.meta.glob('../images/icons/*.(svg|png)', {
  as: 'url',
  eager: true,
});

const keyToUrl = createGlobLoader(iconPathToUrl);

export function getIcon(id: BridgeEntity['id']) {
  return keyToUrl(id);
}
