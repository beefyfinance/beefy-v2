import { ChainEntity } from '../features/data/entities/chain';
import { createGlobLoader } from './globLoader';

const pathToUrl = import.meta.glob<string>('../images/networks/*.svg', {
  as: 'url',
  eager: true,
});
const keyToUrl = createGlobLoader(pathToUrl);

export function getNetworkSrc(chainId: ChainEntity['id']) {
  return keyToUrl([chainId]);
}
