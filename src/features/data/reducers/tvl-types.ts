import type BigNumber from 'bignumber.js';
import type { BoostPromoEntity } from '../entities/promo.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { ChainEntity } from '../apis/chains/entity-types.ts';

type VaultTvl = {
  tvl: BigNumber;
  rawTvl: BigNumber;
};

export type VaultTvlById = {
  [vaultId: VaultEntity['id']]: VaultTvl;
};

type BoostTvl = {
  tvl: BigNumber;
  staked: BigNumber;
};

export type BoostTvlById = {
  [boostId: BoostPromoEntity['id']]: BoostTvl;
};

export type ChainTvlById = {
  [chainId in ChainEntity['id']]?: BigNumber;
};

/**
 * State containing APY infos indexed by vault id
 */
export interface TvlState {
  totalTvl: BigNumber;
  byVaultId: VaultTvlById;
  byBoostId: BoostTvlById;
  byChaindId: ChainTvlById;
}
