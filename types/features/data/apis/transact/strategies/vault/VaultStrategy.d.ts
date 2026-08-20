import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper-types';
import type { DepositOption, DepositQuote, InputTokenAmount, WithdrawOption, WithdrawQuote } from '../../transact-types';
import type { IVaultType } from '../../vaults/IVaultType';
import type { IStrategy } from '../IStrategy';
declare const strategyId = "vault";
type StrategyId = typeof strategyId;
/**
 * This is just a wrapper around IVaultType to make it an IStrategy
 * It does not need to conform to IZapStrategy
 */
export declare class VaultStrategy<T extends IVaultType> implements IStrategy<StrategyId> {
    protected readonly vaultType: T;
    static readonly id = "vault";
    readonly id = "vault";
    constructor(vaultType: T);
    fetchDepositOptions(): Promise<DepositOption[]>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: DepositOption): Promise<DepositQuote>;
    fetchDepositStep(quote: DepositQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOptions(): Promise<WithdrawOption[]>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote>;
    fetchWithdrawStep(quote: WithdrawQuote, t: TFunction<Namespace>): Promise<Step>;
}
export {};
