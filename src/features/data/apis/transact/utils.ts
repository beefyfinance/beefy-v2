import { VaultEntity } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import { TokenEntity, TokenErc20, TokenNative } from '../../entities/token';
import { sortBy } from 'lodash';
import { BeefyState } from '../../../../redux-types';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectTokenById,
} from '../../selectors/tokens';
import { nanoid } from '@reduxjs/toolkit';

export function createQuoteId(optionId: string): string {
  return `${optionId}-${nanoid()}`;
}

export function createOptionId(
  providerId: string,
  vaultId: VaultEntity['id'],
  chainId: ChainEntity['id'],
  addresses: TokenEntity['address'][]
): string {
  return `${providerId}-${vaultId}-${chainId}-${joinSortedAddresses(addresses)}`.toLowerCase();
}

export function createTokensId(
  chainId: ChainEntity['id'],
  addresses: TokenEntity['address'][]
): string {
  return `${chainId}-${joinSortedAddresses(addresses)}`.toLowerCase();
}

export function sortTokens(tokens: TokenEntity[]): TokenEntity[] {
  return sortBy(tokens, token => token.address.toLowerCase());
}

export function sortAddresses(tokens: TokenEntity['address'][]): TokenEntity['address'][] {
  return tokens.map(t => t.toLowerCase()).sort();
}

export function joinSortedAddresses(addresses: TokenEntity['address'][], delim: string = '-') {
  return sortAddresses(addresses).join(delim);
}

export function getOppositeToken(
  state: BeefyState,
  token: TokenEntity,
  vault: VaultEntity,
  wnative: TokenErc20,
  native: TokenNative
) {
  // Return token for assets[1] if input is assets[0]
  if (
    token.id === vault.assetIds[0] ||
    (token.id === wnative.id && native.id === vault.assetIds[0])
  ) {
    return selectTokenById(state, vault.chainId, vault.assetIds[1]);
  }

  // Return token for assets[0] if input is assets[1]
  if (
    token.id === vault.assetIds[1] ||
    (token.id === wnative.id && native.id === vault.assetIds[1])
  ) {
    return selectTokenById(state, vault.chainId, vault.assetIds[0]);
  }

  // Return native token if input is wrapped native???
  if (token.id === wnative.id) {
    return selectChainNativeToken(state, vault.chainId);
  }

  // Otherwise return wrapped native???
  return selectChainWrappedNativeToken(state, vault.chainId);
}
