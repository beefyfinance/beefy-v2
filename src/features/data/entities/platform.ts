import { Chain } from './chain';

/**
 * A platform is a project targeted by vaults
 * Like "curve", "pancakeswap", "etc"
 */
export interface Platform {
  id: string;
  name: string;
  // TODO: maybe this needs to be indexed by chain id
  url: string;

  // todo: maybe this is not needed
  chains: Chain['id'][];
}
