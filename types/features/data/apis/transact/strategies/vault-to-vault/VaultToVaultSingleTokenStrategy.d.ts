import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper-types';
import { type InputTokenAmount, type VaultToVaultSingleTokenDepositOption, type VaultToVaultSingleTokenDepositQuote, type VaultToVaultSingleTokenWithdrawOption, type VaultToVaultSingleTokenWithdrawQuote } from '../../transact-types';
import { type IZapStrategy, type ZapTransactHelpers } from '../IStrategy';
import type { VaultToVaultSingleTokenStrategyConfig } from '../strategy-configs';
declare const strategyId = "vault-to-vault-single-token";
type StrategyId = typeof strategyId;
declare class VaultToVaultSingleTokenStrategyImpl implements IZapStrategy<StrategyId> {
    protected options: VaultToVaultSingleTokenStrategyConfig;
    protected helpers: ZapTransactHelpers;
    static readonly id = "vault-to-vault-single-token";
    readonly id = "vault-to-vault-single-token";
    constructor(options: VaultToVaultSingleTokenStrategyConfig, helpers: ZapTransactHelpers);
    private makeSourceContext;
    private makeDestContext;
    private resolveHelpersForVault;
    fetchDepositOptions(): Promise<VaultToVaultSingleTokenDepositOption[]>;
    fetchWithdrawOptions(): Promise<VaultToVaultSingleTokenWithdrawOption[]>;
    private quoteVaultToVault;
    private stepVaultToVault;
    fetchDepositQuote(inputs: InputTokenAmount[], option: VaultToVaultSingleTokenDepositOption): Promise<VaultToVaultSingleTokenDepositQuote>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: VaultToVaultSingleTokenWithdrawOption): Promise<VaultToVaultSingleTokenWithdrawQuote>;
    fetchDepositStep(quote: VaultToVaultSingleTokenDepositQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawStep(quote: VaultToVaultSingleTokenWithdrawQuote, t: TFunction<Namespace>): Promise<Step>;
}
export declare const VaultToVaultSingleTokenStrategy: typeof VaultToVaultSingleTokenStrategyImpl;
export {};
