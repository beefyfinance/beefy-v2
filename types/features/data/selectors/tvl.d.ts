import BigNumber from 'bignumber.js';
import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
import type { TvlBreakdown } from './tvl-types';
export declare const selectVaultTvl: (state: BeefyState, vaultId: VaultEntity["id"]) => BigNumber;
/** Vault TVL before any exclusions are subtracted */
export declare const selectVaultRawTvl: (state: BeefyState, vaultId: VaultEntity["id"]) => BigNumber;
export declare const selectVaultUnderlyingTvlUsd: (state: BeefyState, vaultId: VaultEntity["id"]) => BigNumber;
export declare const selectTotalTvl: (state: BeefyState) => BigNumber;
export declare const selectTvlByChain: (state: BeefyState) => import("../reducers/tvl-types").ChainTvlById;
export declare const selectTvlBreakdownByVaultId: (state: BeefyState, vaultId: VaultEntity["id"]) => TvlBreakdown;
