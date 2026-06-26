import type { Namespace, TFunction } from 'react-i18next';
import type { TokenEntity, TokenErc20 } from '../../../entities/token.ts';
import type {
  VaultCowcentrated,
  VaultEntity,
  VaultErc4626,
  VaultGov,
  VaultStandard,
} from '../../../entities/vault.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import type { BeefyStateFn } from '../../../store/types.ts';
import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  TokenAmount,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
} from '../transact-types.ts';
import type { ZapStep } from '../zap/types.ts';

export type VaultDepositRequest = {
  inputs: InputTokenAmount[];
  from: string;
};

export type VaultDepositResponse = {
  inputs: InputTokenAmount[];
  outputs: TokenAmount[];
  minOutputs: TokenAmount[];
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

/** Vault types whose single deposit token converts to/from a share token via ppfs */
export interface IPpfsVaultType extends IVaultType {
  readonly depositToken: TokenEntity;
  readonly shareToken: TokenErc20;

  /** Estimate the shares minted for a deposit-token amount entering the vault, using state ppfs */
  estimateDepositShares(input: TokenAmount): TokenAmount<TokenErc20>;

  /** Estimate the deposit-token amount withdrawn for a share-denominated input, using state ppfs */
  estimateWithdrawOutput(input: TokenAmount): TokenAmount<TokenEntity>;
}

export interface IStandardVaultType extends IPpfsVaultType {
  readonly id: 'standard';
  readonly vault: VaultStandard;
}

export interface IGovVaultType extends IVaultType {
  readonly id: 'gov';
  readonly vault: VaultGov;
  readonly depositToken: TokenEntity;
}

export interface ICowcentratedVaultType extends IVaultType {
  readonly id: 'cowcentrated';
  readonly vault: VaultCowcentrated;
  readonly depositTokens: TokenEntity[];
  readonly shareToken: TokenErc20;
}

export interface IErc4626VaultType extends IPpfsVaultType {
  readonly id: 'erc4626';
  readonly vault: VaultErc4626;
}

export type VaultType =
  | IStandardVaultType
  | IGovVaultType
  | ICowcentratedVaultType
  | IErc4626VaultType;

export type VaultTypeFromVault<T extends VaultEntity> = Extract<
  VaultType,
  {
    id: T['type'];
  }
>;

export type VaultTypeConstructor<T extends VaultEntity> = new (
  vault: T,
  getState: BeefyStateFn
) => VaultTypeFromVault<T>;

export function isStandardVaultType(vaultType: VaultType): vaultType is IStandardVaultType {
  return vaultType.id === 'standard';
}

export function isGovVaultType(vaultType: VaultType): vaultType is IGovVaultType {
  return vaultType.id === 'gov';
}

export function isCowcentratedVaultType(vaultType: VaultType): vaultType is ICowcentratedVaultType {
  return vaultType.id === 'cowcentrated';
}

export function isErc4626VaultType(vaultType: VaultType): vaultType is IErc4626VaultType {
  return vaultType.id === 'erc4626';
}

export function isPpfsVaultType(
  vaultType: VaultType
): vaultType is IStandardVaultType | IErc4626VaultType {
  return vaultType.id === 'standard' || vaultType.id === 'erc4626';
}
