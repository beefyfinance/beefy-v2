import type { ChainEntity } from '../features/data/entities/chain.ts';
import { createGlobLoader } from './globLoader.ts';

const pathToUrl = import.meta.glob<string>('../images/networks/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getNetworkSrc(chainId: ChainEntity['id']) {
  return keyToUrl([chainId]);
}
