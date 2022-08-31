import { ChainEntity } from '../features/data/entities/chain';

const requireContext = require.context('../images/networks', false, /\.svg$/);
const networkToPath = Object.fromEntries(
  requireContext.keys().map(path => [path.substring(2, path.lastIndexOf('.')).toUpperCase(), path])
);
const networkCache = {};

export function getNetworkSrc(chainId: ChainEntity['id'] | string) {
  const id = chainId.toUpperCase();

  if (id in networkCache) {
    return networkCache[id];
  }

  if (id in networkToPath) {
    const asset = requireContext(networkToPath[id]).default;
    return (networkCache[id] = asset);
  }
}
