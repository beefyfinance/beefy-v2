import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { type TokenEntity, type TokenErc20 } from '../../../entities/token';
import { type VaultCowcentrated } from '../../../entities/vault';
import type { Step } from '../../../reducers/wallet/stepper-types';
import type { BeefyStateFn } from '../../../store/types';
import { type CowcentratedVaultDepositOption, type CowcentratedVaultDepositQuote, type CowcentratedVaultWithdrawOption, type CowcentratedVaultWithdrawQuote, type InputTokenAmount } from '../transact-types';
import type { ZapStep } from '../zap/types';
import type { ICowcentratedVaultType, VaultDepositRequest, VaultDepositResponse, VaultWithdrawRequest, VaultWithdrawResponse } from './IVaultType';
export declare class CowcentratedVaultType implements ICowcentratedVaultType {
    readonly id = "cowcentrated";
    readonly vault: VaultCowcentrated;
    readonly depositTokens: TokenEntity[];
    readonly shareToken: TokenErc20;
    protected readonly getState: BeefyStateFn;
    constructor(vault: VaultCowcentrated, getState: BeefyStateFn);
    fetchDepositOption(): Promise<CowcentratedVaultDepositOption>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: CowcentratedVaultDepositOption): Promise<CowcentratedVaultDepositQuote>;
    fetchDepositStep(quote: CowcentratedVaultDepositQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOption(): Promise<CowcentratedVaultWithdrawOption>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: CowcentratedVaultWithdrawOption): Promise<CowcentratedVaultWithdrawQuote>;
    fetchWithdrawStep(quote: CowcentratedVaultWithdrawQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse>;
    fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse>;
    protected buildZapDepositTx(clmAddress: string, amountA: BigNumber, amountB: BigNumber, minShares: BigNumber, tokenA: string, tokenB: string, insertBalance: boolean): ZapStep;
    protected buildZapWithdrawTx(clmAddress: string, amountToWithdrawWei: BigNumber, minAmountAWei: BigNumber, minAmountBWei: BigNumber, withdrawAll: boolean): ZapStep;
}
