/**
 * A platform is a project targeted by vaults
 * Like "curve", "pancakeswap", "etc"
 */
export interface PlatformEntity {
  id: string;
  name: string;
  // TODO: maybe this needs to be indexed by chain id
  url?: string;
}
