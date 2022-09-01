const requireContext = require.context('../images/currency-flags', false, /\.png$/);
const currencyCodeToPath = Object.fromEntries(
  requireContext.keys().map(path => [path.substring(2, path.lastIndexOf('.')).toLowerCase(), path])
);
const currencyCache = {};

export function getCurrencyFlag(currencyCode: string): string | undefined {
  const id = currencyCode.toLowerCase();

  if (id in currencyCache) {
    return currencyCache[id];
  }

  if (id in currencyCodeToPath) {
    const asset = requireContext(currencyCodeToPath[id]).default;
    return (currencyCache[id] = asset);
  }
}
