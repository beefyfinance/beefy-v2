import { createGlobLoader } from './globLoader.ts';
import type { ChainEntity } from '../features/data/apis/chains/entity-types.ts';

const pathToUrl = import.meta.glob<string>('../images/networks/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getNetworkSrc(chainId: ChainEntity['id']) {
  return keyToUrl([chainId]);
}
