export function extractChainId(path: string): string {
  const match = path.match(/.+\/chain\/(.+).json$/);
  const chainId = match?.[1];
  if (chainId) {
    return chainId;
  }
  throw new Error(`Could not extract chain id from path: ${path}`);
}
