/* eslint-disable @typescript-eslint/consistent-type-imports -- relative imports are not allowed inside ambient module declarations */
declare module 'virtual:chain-loaders' {
  type EnabledChainId = import('../../config/config.ts').EnabledChainId;
  type Chain = import('@beefyfinance/blockchain-addressbook/types/chain').Chain;
  type VaultConfig = import('../../features/data/apis/config-types.ts').VaultConfig;
  type AmmConfig = import('../../features/data/apis/config-types.ts').AmmConfig;
  type MinterConfig = import('../../features/data/apis/config-types.ts').MinterConfig;
  type PromoConfig = import('../../features/data/apis/promos/types.ts').PromoConfig;

  type ChainLoaders<T> = Readonly<Record<EnabledChainId, () => Promise<T>>>;
  type OptionalChainLoaders<T> = Readonly<Partial<ChainLoaders<T>>>;

  export const addressBook: ChainLoaders<Chain>;
  export const vaults: ChainLoaders<VaultConfig[]>;
  export const amms: OptionalChainLoaders<AmmConfig[]>;
  export const promos: OptionalChainLoaders<PromoConfig[]>;
  export const minters: OptionalChainLoaders<MinterConfig[]>;
}
