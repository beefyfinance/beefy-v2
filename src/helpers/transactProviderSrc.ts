const requireContext = require.context('../images/transact-providers', false, /\.svg$/);
const providerToPath = Object.fromEntries(
  requireContext.keys().map(path => [path.substring(2, path.lastIndexOf('.')).toLowerCase(), path])
);
const providerCache = {};

export function getTransactProviderIcon(provider: string): string | undefined {
  const id = provider.toLowerCase();

  if (id in providerCache) {
    return providerCache[id];
  }

  if (id in providerToPath) {
    const asset = requireContext(providerToPath[id]).default;
    return (providerCache[id] = asset);
  }
}
