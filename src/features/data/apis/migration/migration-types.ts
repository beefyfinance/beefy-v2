import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { Address, Chain } from 'viem';
import type { VaultEntity } from '../../entities/vault.ts';
import type { BeefyDispatchFn, BeefyStateFn } from '../../store/types.ts';
import type { GasPricing } from '../gas-prices/gas-prices.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';

export interface IMigrationApi {
  getMigrator(id: string): Promise<Migrator>;
}

export type MigratorLoadParams = {
  readonly migrationId: string;
};

export type MigratorLoadPayload = Omit<Migrator, 'update' | 'execute'>;

export type MigratorUpdateParams = {
  readonly vaultId: VaultEntity['id'];
  readonly migrationId: string;
  readonly walletAddress: string;
};

export type MigratorExecuteParams = MigratorUpdateParams & {
  readonly t: TFunction<Namespace>;
};

export type MigratorUnstakeProps = {
  account: Address;
  chain: Chain | undefined;
} & GasPricing;

export type UpdateParams<TId extends string = string> = {
  migrationId: TId;
  vault: VaultEntity;
  walletAddress: Address;
  dispatch: BeefyDispatchFn;
  getState: BeefyStateFn;
};

export type BaseUserData = {
  /** balance of deposit token in decimals */
  balance: BigNumber;
  /** optional symbol to display in the UI */
  symbol?: string;
};

export type UpdateResult<TId extends string = string, TData extends BaseUserData = BaseUserData> = {
  migrationId: TId;
  data: TData;
};

export type UpdatePayload<
  TId extends string = string,
  TData extends BaseUserData = BaseUserData,
> = UpdateResult<TId, TData> & {
  vault: VaultEntity;
  walletAddress: Address;
};

export type ExecuteParams<
  TId extends string = string,
  TData extends BaseUserData = BaseUserData,
> = {
  migrationId: TId;
  vault: VaultEntity;
  walletAddress: Address;
  t: TFunction<Namespace>;
  dispatch: BeefyDispatchFn;
  getState: BeefyStateFn;
  data: TData;
};

export type ExecuteResult<TId extends string = string> = {
  migrationId: TId;
  steps: Step[];
};

export type ExecutePayload<TId extends string = string> = ExecuteResult<TId> & {
  vault: VaultEntity;
};

export type UpdateFn<TId extends string = string, TData extends BaseUserData = BaseUserData> = (
  params: UpdateParams<TId>
) => Promise<UpdateResult<TId, TData>>;

export type ExecuteFn<TId extends string = string, TData extends BaseUserData = BaseUserData> = (
  params: ExecuteParams<TId, TData>
) => Promise<ExecuteResult<TId>>;

export interface Migrator<TId extends string = string, TData extends BaseUserData = BaseUserData> {
  id: TId;
  name: string;
  icon: string;
  update: UpdateFn<TId, TData>;
  execute: ExecuteFn<TId, TData>;
}
