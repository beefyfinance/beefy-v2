import type { VaultEntity, VaultGov, VaultStandard } from '../../../entities/vault';
import type { GetStateFn } from '../../../../../redux-types';
import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  TokenAmount,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
} from '../transact-types';
import type { TokenEntity, TokenErc20 } from '../../../entities/token';
import type { ZapStep } from '../zap/types';
import type { Step } from '../../../reducers/wallet/stepper';
import type { Namespace, TFunction } from 'react-i18next';

export type VaultDepositRequest = {
  inputs: InputTokenAmount[];
};

export type VaultDepositResponse = {
  inputs: InputTokenAmount[];
  outputs: TokenAmount[];
  zap: ZapStep;
};

export type VaultWithdrawRequest = VaultDepositRequest;
export type VaultWithdrawResponse = VaultDepositResponse;

export interface IVaultType {
  readonly id: VaultEntity['type'];
  readonly vault: VaultEntity;

  fetchDepositOption(): Promise<DepositOption>;

  fetchDepositQuote(inputs: InputTokenAmount[], option: DepositOption): Promise<DepositQuote>;

  fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;

  fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse>;

  fetchWithdrawOption(): Promise<WithdrawOption>;

  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote>;

  fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step>;

  fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse>;
}

export interface IStandardVaultType extends IVaultType {
  readonly id: 'standard';
  readonly vault: VaultStandard;
  readonly depositToken: TokenEntity;
  readonly shareToken: TokenErc20;
}

export interface IGovVaultType extends IVaultType {
  readonly id: 'gov';
  readonly vault: VaultGov;
  readonly depositToken: TokenEntity;
}

export type VaultType = IStandardVaultType | IGovVaultType;

export type VaultTypeConstructor<T extends VaultType = VaultType> = new (
  vault: VaultEntity,
  getState: GetStateFn
) => T;

export function isStandardVaultType(vaultType: VaultType): vaultType is IStandardVaultType {
  return vaultType.id === 'standard';
}

export function isGovVaultType(vaultType: VaultType): vaultType is IGovVaultType {
  return vaultType.id === 'gov';
}
