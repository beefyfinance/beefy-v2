import { AbiItem } from 'web3-utils';
import _zapAbi from '../../../../config/abi/zap.json';
import { BeefyState } from '../../../../redux-types';
import { TokenEntity, TokenErc20, TokenNative } from '../../entities/token';
import { VaultEntity } from '../../entities/vault';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectTokenById,
} from '../../selectors/tokens';

export const zapAbi = _zapAbi as AbiItem | AbiItem[];

export const sortTokens = (tokenA, tokenB) => {
  if (tokenA === tokenB) {
    throw new RangeError(`Zap: tokenA should not be equal to tokenB: ${tokenB}`);
  }

  return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
};

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
