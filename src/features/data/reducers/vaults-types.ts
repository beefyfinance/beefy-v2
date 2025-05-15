import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  /** All vault ids that have hidden: false */
  allVisibleIds: VaultEntity['id'][];
  /** All chains that have at least 1 vault */
  allChainIds: ChainEntity['id'][];
  /** Vaults that have status: active, hidden: false */
  allActiveIds: VaultEntity['id'][];
  /** Vaults that have bridged receipt tokens we should track */
  allBridgedIds: VaultEntity['id'][];
  /** Relations between vaults */
  relations: {
    /** which vault does vaultId use as its deposit token  */
    underlyingOf: {
      byId: {
        [vaultId: VaultEntity['id']]: VaultEntity['id'];
      };
    };
    /** which vaults is vaultId the deposit token for  */
    depositFor: {
      byId: {
        [vaultId: VaultEntity['id']]: VaultEntity['id'][];
      };
    };
  };
  /** Vaults id look up by type */
  byType: {
    [type in VaultEntity['type']]: {
      /** Vaults on chain of type */
      allIds: VaultEntity['id'][];
    };
  };
  /** Vaults id look up by chain id */
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      /** Vaults on chain, includes hidden */
      allIds: VaultEntity['id'][];
      /** Vaults by their contract address */
      byAddress: {
        [address: string]: VaultEntity['id'];
      };
      byType: {
        [type in VaultEntity['type']]: {
          /** Vaults on chain of type */
          allIds: VaultEntity['id'][];
          /** Find {type} vaults by contract address (earnContractAddress) */
          byAddress: {
            [address: string]: VaultEntity['id'];
          };
          /** Find {type} vaults by deposit token address */
          byDepositTokenAddress: {
            [address: string]: VaultEntity['id'][];
          };
        };
      };
    };
  };

  /**
   * pricePerFullShare is how you find out how much your mooTokens
   * (shares) represent in term of the underlying asset
   *
   * So if you deposit 1 BIFI you will get, for example 0.95 mooBIFI,
   * with a ppfs of X, if you multiply your mooBIIFI * ppfs you get your amount in BIFI
   *
   * That value is fetched from the smart contract upon loading
   **/
  contractData: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: {
        strategyAddress?: string;
        pricePerFullShare?: BigNumber | null;
        balances?: BigNumber[];
      };
    };
  };

  lastHarvestById: {
    [vaultId: VaultEntity['id']]: number;
  };
};
