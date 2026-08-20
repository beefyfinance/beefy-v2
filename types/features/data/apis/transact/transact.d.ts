import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { ChainEntity } from '../../entities/chain';
import { type VaultEntity } from '../../entities/vault';
import type { Step } from '../../reducers/wallet/stepper-types';
import type { CrossChainRecoveryParams } from '../../reducers/wallet/transact-types';
import type { BeefyStateFn } from '../../store/types';
import { type IStrategy, type ChainTransactHelpers, type TransactHelpers } from './strategies/IStrategy';
import { type AnyZapStrategyStatic, type ComposableStrategyId, type StrategyIdToStatic } from './strategies/strategies';
import type { StrategyIdToConfig, ZapStrategyConfig, ZapStrategyId } from './strategies/strategy-configs';
import { type DepositOption, type DepositQuote, type InputTokenAmount, type ITransactApi, type RecoveryQuote, type TransactQuote, type WithdrawOption, type WithdrawQuote } from './transact-types';
type StrategyConstructorWithOptions<TId extends ZapStrategyId = ZapStrategyId> = {
    [K in TId]: {
        id: K;
        ctor: StrategyIdToStatic[K];
        options: StrategyIdToConfig<K>;
    };
}[TId];
type GenericStrategyConstructorWithOptions = {
    id: ZapStrategyId;
    ctor: AnyZapStrategyStatic;
    options: ZapStrategyConfig;
};
type ComposableStrategyConstructorWithOptions = StrategyConstructorWithOptions<ComposableStrategyId>;
export declare function isComposableStrategyConstructorWithOptions(strategy: GenericStrategyConstructorWithOptions): strategy is ComposableStrategyConstructorWithOptions;
export declare class TransactApi implements ITransactApi {
    private helpersCache;
    getHelpersForChain(chainId: ChainEntity['id'], getState: BeefyStateFn): Promise<ChainTransactHelpers>;
    getHelpersForVault(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<TransactHelpers>;
    fetchDepositOptionsFor(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<DepositOption[]>;
    fetchDepositQuotesFor(options: DepositOption[], amounts: InputTokenAmount[], getState: BeefyStateFn): Promise<DepositQuote[]>;
    fetchDepositStep(quote: TransactQuote, getState: BeefyStateFn, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOptionsFor(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<WithdrawOption[]>;
    fetchWithdrawQuotesFor(options: WithdrawOption[], amounts: InputTokenAmount[], getState: BeefyStateFn): Promise<WithdrawQuote[]>;
    private getVaultTypeFor;
    fetchWithdrawStep(quote: TransactQuote, getState: BeefyStateFn, t: TFunction<Namespace>): Promise<Step>;
    fetchVaultHasZap(vaultId: VaultEntity['id'], getState: BeefyStateFn): Promise<boolean>;
    getZapStrategiesForVault(helpers: TransactHelpers, filter?: (zapConfig: ZapStrategyConfig) => boolean): Promise<IStrategy[]>;
    getInnerZapStrategiesForVault(helpers: TransactHelpers, filter?: (zapConfig: ZapStrategyConfig) => boolean): Promise<IStrategy[]>;
    private buildZapStrategiesForVault;
    private getZapStrategyConstructorsForVault;
    private buildZapStrategy;
    private getComposableStrategyForZap;
    private getStrategyById;
    fetchRecoveryQuote(recovery: CrossChainRecoveryParams, actualBridgedAmount: BigNumber, getState: BeefyStateFn, pageVaultId: VaultEntity['id']): Promise<RecoveryQuote>;
    fetchRecoveryStep(recovery: CrossChainRecoveryParams, quote: RecoveryQuote, opId: string, getState: BeefyStateFn, t: TFunction<Namespace>, pageVaultId: VaultEntity['id']): Promise<Step>;
    private anyComposableStrategyAcceptsUsdcDeposit;
    private anyComposableStrategyAcceptsUsdcWithdraw;
    private anyComposableStrategyAcceptsAnyRoutingDeposit;
}
export {};
