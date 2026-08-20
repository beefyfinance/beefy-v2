import BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { type TokenEntity, type TokenErc20 } from '../../../entities/token';
import { type VaultErc4626 } from '../../../entities/vault';
import type { Step } from '../../../reducers/wallet/stepper-types';
import type { BeefyState, BeefyStateFn } from '../../../store/types';
import { type Erc4626VaultDepositOption, type Erc4626VaultDepositQuote, type Erc4626VaultWithdrawOption, type Erc4626VaultWithdrawQuote, type InputTokenAmount, type TokenAmount, type TransactQuote } from '../transact-types';
import type { ZapStep } from '../zap/types';
import type { IErc4626VaultType, VaultDepositRequest, VaultDepositResponse, VaultWithdrawRequest, VaultWithdrawResponse } from './IVaultType';
export declare class Erc4626VaultType implements IErc4626VaultType {
    readonly id = "erc4626";
    readonly vault: VaultErc4626;
    readonly depositToken: TokenEntity;
    readonly shareToken: TokenErc20;
    protected readonly getState: BeefyStateFn;
    constructor(vault: VaultErc4626, getState: BeefyStateFn);
    protected calculateDepositFee(input: TokenAmount, state: BeefyState): BigNumber;
    fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse>;
    protected fetchErc20ZapDeposit(vaultAddress: string, fromAddress: string, depositToken: TokenErc20, depositAmount: BigNumber, _depositAll: boolean): ZapStep;
    fetchDepositOption(): Promise<Erc4626VaultDepositOption>;
    fetchDepositQuote(inputs: InputTokenAmount[], option: Erc4626VaultDepositOption): Promise<Erc4626VaultDepositQuote>;
    fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchWithdrawOption(): Promise<Erc4626VaultWithdrawOption>;
    fetchWithdrawQuote(inputs: InputTokenAmount[], option: Erc4626VaultWithdrawOption): Promise<Erc4626VaultWithdrawQuote>;
    fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;
    fetchZapWithdraw(_request: VaultWithdrawRequest): Promise<VaultWithdrawResponse>;
}
