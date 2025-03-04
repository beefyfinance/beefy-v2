import type { PlatformConfig } from '../apis/config-types.ts';

/**
 * A platform is a project targeted by vaults
 * Like "curve", "pancakeswap", "etc"
 */
export interface PlatformEntity {
  id: string;
  name: string;
  risks: string[];
  description?: string;
  twitter: string;
  website: string;
  documentation: string;
  type?: PlatformConfig['type'];
}
