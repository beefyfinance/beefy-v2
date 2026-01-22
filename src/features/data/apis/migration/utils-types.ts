import type { VaultEntity } from '../../entities/vault.ts';
import type { BeefyState } from '../../store/types.ts';
import type { BaseUserData, ExecuteParams, MigratorUnstakeProps } from './migration-types.ts';
import type { Hash, WalletClient } from 'viem';

/** return balance of beefy's vault's deposit token, in wei */
export type FetchBalanceFn = (
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
) => Promise<string>;

export type BuildUpdateOptions = {
  /** show e.g. `agEUR-USDC.e rLP` over `LP tokens` in the UI, useful for single-asset vaults */
  useDepositTokenSymbol?: boolean;
};

export type UnstakeCallFn = (args: MigratorUnstakeProps) => Promise<Hash>;

export type BuildUnstakeCallParams<
  TId extends string = string,
  TData extends BaseUserData = BaseUserData,
> = ExecuteParams<TId, TData> & {
  walletClient: WalletClient;
};

export type BuildUnstakeCallFn<
  TId extends string = string,
  TData extends BaseUserData = BaseUserData,
> = (params: BuildUnstakeCallParams<TId, TData>) => Promise<UnstakeCallFn>;

export type BuildExecuteOptions = {
  /** deposit the user's current balance, not the balance we queried at the update stage */
  depositMax?: boolean;
};
