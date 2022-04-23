const singleAssetRequire = (require as any).context(
  '../images/single-assets',
  false,
  /\.(svg|webp|png)$/
);
const singleAssets = Object.fromEntries(
  singleAssetRequire.keys().map(path => [path.substring(2, path.lastIndexOf('.')), path])
);
const singleAssetCache = {};

export function getSingleAssetSrc(symbol) {
  if (symbol in singleAssetCache) {
    return singleAssetCache[symbol];
  }

  if (symbol in singleAssets) {
    const asset = singleAssetRequire(singleAssets[symbol]).default;
    return (singleAssetCache[symbol] = asset);
  }

  return undefined;
}

export function getAssetSrc(uri: string) {
  try {
    return require(`../images/${uri}`).default;
  } catch {
    return undefined;
  }
}
