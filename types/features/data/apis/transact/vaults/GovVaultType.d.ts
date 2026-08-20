import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { TokenEntity } from '../../../entities/token';
import { type VaultGov } from '../../../entities/vault';
import type { Step } from '../../../reducers/wallet/stepper-types';
import type { BeefyState, BeefyStateFn } from '../../../store/types';
import { type GovVaultDepositOption, type GovVaultDepositQuote, type GovVaultWithdrawOption, type GovVaultWithdrawQuote, type InputTokenAmount, type TokenAmount, type TransactQuote } from '../transact-types';
import type { IGovVaultType, VaultDepositRequest, VaultDepositResponse, VaultWithdrawRequest, VaultWithdrawResponse } from './IVaultType';
export declare class GovVaultType implements IGovVaultType {
    readonly id = "gov";
    readonly vault: VaultGov;
    readonly depositToken: TokenEntity;
    protected readonly getState: BeefyStateFn;
    constructor(vault: VaultGov, getState: BeefyStateFn);
    protected calculateDepositFee(input: TokenAmount, state: BeefyState): BigNumber;
    protected calculateWithdrawFee(input: TokenAmount, state: BeefyState): BigNumber;
    fetchDepositOption(): Promise<GovVaultDepositOption>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: GovVaultDepositOption): Promise<GovVaultDepositQuote>;
    fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOption(): Promise<GovVaultWithdrawOption>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: GovVaultWithdrawOption): Promise<GovVaultWithdrawQuote>;
    fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchZapDeposit(_request: VaultDepositRequest): Promise<VaultDepositResponse>;
    fetchZapWithdraw(_request: VaultWithdrawRequest): Promise<VaultWithdrawResponse>;
}
