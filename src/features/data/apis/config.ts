// todo: load these asynchronously
import { pools as arbitrumVaults } from '../../../config/vault/arbitrum';
import { pools as avaxVaults } from '../../../config/vault/avax';
import { pools as bscVaults } from '../../../config/vault/bsc';
import { pools as celoVaults } from '../../../config/vault/celo';
import { pools as cronosVaults } from '../../../config/vault/cronos';
import { pools as fantomVaults } from '../../../config/vault/fantom';
import { pools as fuseVaults } from '../../../config/vault/fuse';
import { pools as harmonyVaults } from '../../../config/vault/harmony';
import { pools as hecoVaults } from '../../../config/vault/heco';
import { pools as moonriverVaults } from '../../../config/vault/moonriver';
import { pools as polygonVaults } from '../../../config/vault/polygon';
import { Chain } from '../entities/chain';

const vaultsByChainId = {
  arbitrum: arbitrumVaults,
  avax: avaxVaults,
  bsc: bscVaults,
  celo: celoVaults,
  cronos: cronosVaults,
  fantom: fantomVaults,
  fuse: fuseVaults,
  harmony: harmonyVaults,
  heco: hecoVaults,
  moonriver: moonriverVaults,
  polygon: polygonVaults,
};

/**
 * A class to access beefy configuration
 * Access to vaults, boosts, featured items, etc
 * TODO: this class loads unnecessary data from the start of the app. Make it so only required data is fetched
 */
export class ConfigAPI {
  public async fetchVaultByChainId(chainId: Chain['id']) {
    if (vaultsByChainId[chainId] !== undefined) {
      return vaultsByChainId[chainId];
    } else {
      throw Error(`Chain ${chainId} not supported`);
    }
  }
}
