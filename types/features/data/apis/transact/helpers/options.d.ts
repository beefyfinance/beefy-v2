import type { VaultEntity, VaultGov, VaultStandard } from '../../../entities/vault';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenEntity } from '../../../entities/token';
import type { InputTokenAmount, TokenAmount } from '../transact-types';
export declare function createQuoteId(optionId: string): string;
export declare function createOptionId(strategyId: string, vaultId: VaultEntity['id'], selectionId: string, differentiator?: string): string;
export declare function createSelectionId(chainId: ChainEntity['id'], tokens: TokenEntity[], type?: string): string;
export declare function onlyVaultType<T extends VaultEntity>(vault: VaultEntity, validType: T['type']): vault is T;
export declare function onlyVaultStandard(vault: VaultEntity): vault is VaultStandard;
export declare function onlyVaultGov(vault: VaultEntity): vault is VaultGov;
export declare function onlyAssetCount(vault: VaultEntity, count: number): void;
export declare function onlyInputCount(inputs: TokenAmount[], count: number): void;
export declare function onlyOneInput(inputs: InputTokenAmount[]): InputTokenAmount;
export declare function onlyOneTokenAmount(outputs: TokenAmount[]): TokenAmount;
export declare function onlyOneToken(tokens: TokenEntity[]): TokenEntity;
export declare function isOptionFeeable(option: {
    feeable?: boolean;
}): boolean;
