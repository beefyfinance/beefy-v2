import type { Namespace, TFunction } from 'react-i18next';
import { type TokenEntity } from '../../../entities/token';
import type { Step } from '../../../reducers/wallet/stepper-types';
import { type InputTokenAmount, type ZapStrategyIdToDepositOption, type ZapStrategyIdToDepositQuote, type ZapStrategyIdToWithdrawOption, type ZapStrategyIdToWithdrawQuote } from '../transact-types';
import type { IComposableStrategy, TransactHelpers, UserlessZapDepositBreakdown, UserlessZapWithdrawBreakdown, ZapTransactHelpers } from './IStrategy';
import type { ZapStrategyId } from './strategy-configs';
export declare class ChargeFeeStrategy<TId extends ZapStrategyId = ZapStrategyId> implements IComposableStrategy<TId> {
    protected inner: IComposableStrategy<TId>;
    protected helpers: ZapTransactHelpers;
    readonly id: TId;
    constructor(inner: IComposableStrategy<TId>, helpers: ZapTransactHelpers);
    get disableVaultDeposit(): boolean | undefined;
    get disableVaultWithdraw(): boolean | undefined;
    beforeQuote(): Promise<void>;
    beforeStep(): Promise<void>;
    getHelpers(): TransactHelpers;
    fetchDepositOptions(): Promise<ZapStrategyIdToDepositOption<TId>[]>;
    fetchWithdrawOptions(): Promise<ZapStrategyIdToWithdrawOption<TId>[]>;
    canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean>;
    canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: ZapStrategyIdToDepositOption<TId>): Promise<ZapStrategyIdToDepositQuote<TId>>;
    fetchDepositUserlessZapBreakdown(quote: ZapStrategyIdToDepositQuote<TId>): Promise<UserlessZapDepositBreakdown>;
    fetchDepositStep(quote: ZapStrategyIdToDepositQuote<TId>, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: ZapStrategyIdToWithdrawOption<TId>): Promise<ZapStrategyIdToWithdrawQuote<TId>>;
    fetchWithdrawUserlessZapBreakdown(quote: ZapStrategyIdToWithdrawQuote<TId>): Promise<UserlessZapWithdrawBreakdown>;
    fetchWithdrawStep(quote: ZapStrategyIdToWithdrawQuote<TId>, t: TFunction<Namespace>): Promise<Step>;
}
