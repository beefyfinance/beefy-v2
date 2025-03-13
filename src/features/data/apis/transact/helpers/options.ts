import type { VaultEntity, VaultGov, VaultStandard } from '../../../entities/vault.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import { nanoid } from '@reduxjs/toolkit';
import { sortTokens } from './tokens.ts';
import type { InputTokenAmount, TokenAmount } from '../transact-types.ts';

export function createQuoteId(optionId: string): string {
  return `${optionId}-${nanoid()}`;
}

export function createOptionId(
  strategyId: string,
  vaultId: VaultEntity['id'],
  selectionId: string,
  differentiator?: string
): string {
  return [strategyId, vaultId, selectionId, differentiator]
    .filter(v => !!v)
    .join('-')
    .toLowerCase();
}

export function createSelectionId(
  chainId: ChainEntity['id'],
  tokens: TokenEntity[],
  type: string = 'standard'
): string {
  return [type, chainId, ...sortTokens(tokens).map(t => t.address)]
    .filter(v => !!v)
    .join('-')
    .toLowerCase();
}

export function onlyVaultType<T extends VaultEntity>(
  vault: VaultEntity,
  validType: T['type']
): vault is T {
  if (vault.type !== validType) {
    throw new Error(`Invalid vault type ${vault.type}, expected ${validType}`);
  }

  return true;
}

export function onlyVaultStandard(vault: VaultEntity): vault is VaultStandard {
  return onlyVaultType(vault, 'standard');
}

export function onlyVaultGov(vault: VaultEntity): vault is VaultGov {
  return onlyVaultType(vault, 'gov');
}

export function onlyAssetCount(vault: VaultEntity, count: number) {
  if (vault.assetIds.length !== count) {
    throw new Error(`Invalid asset count ${vault.assetIds.length}, expected ${count}`);
  }
}

export function onlyInputCount(inputs: TokenAmount[], count: number) {
  if (inputs.length !== count) {
    throw new Error(`Invalid input count ${inputs.length}, expected ${count}`);
  }
}

export function onlyOneInput(inputs: InputTokenAmount[]) {
  if (inputs.length !== 1) {
    throw new Error(`Invalid input count ${inputs.length}, expected 1`);
  }
  return inputs[0];
}

export function onlyOneTokenAmount(outputs: TokenAmount[]) {
  if (outputs.length !== 1) {
    throw new Error(`Invalid output count ${outputs.length}, expected 1`);
  }
  return outputs[0];
}

export function onlyOneToken(tokens: TokenEntity[]) {
  if (tokens.length !== 1) {
    throw new Error(`Invalid token count ${tokens.length}, expected 1`);
  }
  return tokens[0];
}
