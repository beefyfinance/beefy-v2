import type { Namespace, TFunction } from 'react-i18next';
import type { TokenEntity } from '../../../entities/token.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { ZapEntity } from '../../../entities/zap.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { Balances } from '../helpers/Balances.ts';
import type { ISwapAggregator } from '../swap/ISwapAggregator.ts';
import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
  ZapStrategyIdToDepositOption,
  ZapStrategyIdToDepositQuote,
  ZapStrategyIdToWithdrawOption,
  ZapStrategyIdToWithdrawQuote,
} from '../transact-types.ts';
import type { VaultTypeFromVault } from '../vaults/IVaultType.ts';
import type { UserlessZapRequest } from '../zap/types.ts';
import type { AnyStrategyId, StrategyIdToConfig, ZapStrategyId } from './strategy-configs.ts';

export interface IStrategy<TId extends AnyStrategyId = AnyStrategyId> {
  readonly id: TId;
  readonly disableVaultDeposit?: boolean;
  readonly disableVaultWithdraw?: boolean;

  beforeQuote?(): Promise<void>;

  beforeStep?(): Promise<void>;

  fetchDepositOptions(): Promise<DepositOption[]>;

  fetchDepositQuote(inputs: InputTokenAmount[], option: DepositOption): Promise<DepositQuote>;

  fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;

  fetchWithdrawOptions(): Promise<WithdrawOption[]>;

  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote>;

  fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;
}

export interface IZapStrategy<TId extends ZapStrategyId = ZapStrategyId> extends IStrategy<TId> {
  fetchDepositOptions(): Promise<ZapStrategyIdToDepositOption<TId>[]>;

  fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToDepositOption<TId>
  ): Promise<ZapStrategyIdToDepositQuote<TId>>;

  fetchDepositStep(quote: ZapStrategyIdToDepositQuote<TId>, t: TFunction<Namespace>): Promise<Step>;

  fetchWithdrawOptions(): Promise<ZapStrategyIdToWithdrawOption<TId>[]>;

  fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToWithdrawOption<TId>
  ): Promise<ZapStrategyIdToWithdrawQuote<TId>>;

  fetchWithdrawStep(
    quote: ZapStrategyIdToWithdrawQuote<TId>,
    t: TFunction<Namespace>
  ): Promise<Step>;
}

export type IComposerStrategy<TId extends ZapStrategyId = ZapStrategyId> = IZapStrategy<TId>;

export type UserlessZapDepositBreakdown = {
  zapRequest: UserlessZapRequest;
  expectedTokens: TokenEntity[];
  minBalances: Balances;
};

export type UserlessZapWithdrawBreakdown = {
  zapRequest: UserlessZapRequest;
  expectedTokens: TokenEntity[];
};

export interface IComposableStrategy<TId extends ZapStrategyId = ZapStrategyId>
  extends IZapStrategy<TId> {
  getHelpers(): TransactHelpers;
  fetchDepositUserlessZapBreakdown(
    quote: ZapStrategyIdToDepositQuote<TId>
  ): Promise<UserlessZapDepositBreakdown>;
  fetchWithdrawUserlessZapBreakdown(
    quote: ZapStrategyIdToWithdrawQuote<TId>
  ): Promise<UserlessZapWithdrawBreakdown>;
}

export type AnyComposableStrategy<TId extends ZapStrategyId = ZapStrategyId> = {
  [K in TId]: IComposableStrategy<K>;
}[TId];

export interface IZapStrategyStatic<TId extends ZapStrategyId = ZapStrategyId> {
  readonly id: TId;

  new (options: StrategyIdToConfig<TId>, helpers: ZapTransactHelpers): IZapStrategy<TId>;
}

export interface IComposableStrategyStatic<TId extends ZapStrategyId = ZapStrategyId> {
  readonly id: TId;
  readonly composable: true;

  new (options: StrategyIdToConfig<TId>, helpers: ZapTransactHelpers): IComposableStrategy<TId>;
}

export type AnyComposableStrategyStatic<TId extends ZapStrategyId = ZapStrategyId> = {
  [K in TId]: IComposableStrategyStatic<K>;
}[TId];

export interface IComposerStrategyStatic<TId extends ZapStrategyId = ZapStrategyId> {
  readonly id: TId;
  readonly composer: true;

  new (
    options: StrategyIdToConfig<TId>,
    helpers: ZapTransactHelpers,
    underlying: AnyComposableStrategy
  ): IComposerStrategy<TId>;
}

export type IAnyStrategyStatic<TId extends ZapStrategyId = ZapStrategyId> =
  | IZapStrategyStatic<TId>
  | IComposableStrategyStatic<TId>
  | IComposerStrategyStatic<TId>;

type BaseTransactHelpers<T extends VaultEntity = VaultEntity> = {
  swapAggregator: ISwapAggregator;
  vault: T;
  vaultType: VaultTypeFromVault<T>;
  getState: () => BeefyState;
};

export type ZaplessTransactHelpers = BaseTransactHelpers & {
  zap: undefined;
};

export type ZapTransactHelpers = BaseTransactHelpers & {
  zap: ZapEntity;
};

export type TransactHelpers = ZaplessTransactHelpers | ZapTransactHelpers;

export function isZapTransactHelpers(helpers: TransactHelpers): helpers is ZapTransactHelpers {
  return helpers.zap !== undefined;
}
