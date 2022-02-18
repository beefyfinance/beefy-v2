import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';
import { addressBook as _addressBook } from 'blockchain-addressbook';
import { VaultEntity } from '../entities/vault';
import { BeefyState } from '../../../redux-types';
import { selectVaultById } from '../selectors/vaults';
import {
  selectAddressBookNativeToken,
  selectAddressBookTokenById,
  selectAddressBookWrappedNativeToken,
} from '../selectors/tokens';
import { AddressBookToken } from './addressbook';

export interface ZapOptions {
  address: string;
  router: string;
  tokens: AddressBookToken[];
}

export async function getEligibleZapOptions(
  state: BeefyState,
  vaultId: VaultEntity['id']
): Promise<ZapOptions | null> {
  const vault = selectVaultById(state, vaultId);
  if (vault.assetIds.length !== 2) {
    return null;
  }

  const oracleToken = selectAddressBookTokenById(state, vault.chainId, vault.oracleId);
  const wnative = selectAddressBookWrappedNativeToken(state, vault.chainId);
  const native = selectAddressBookNativeToken(state, vault.chainId);
  const tokenA = selectAddressBookTokenById(state, vault.chainId, vault.assetIds[0]);
  const tokenB = selectAddressBookTokenById(state, vault.chainId, vault.assetIds[1]);

  const zap = state.entities.zaps.byChainId[vault.chainId].find(zap => {
    return (
      oracleToken.contractAddress ===
      computePairAddress(
        zap.ammFactory,
        zap.ammPairInitHash,
        tokenA.contractAddress,
        tokenB.contractAddress
      )
    );
  });
  if (!zap) {
    return null;
  }

  const zapOptions = [tokenA, tokenB];

  if (
    tokenA.contractAddress === wnative.contractAddress ||
    tokenB.contractAddress === wnative.contractAddress
  ) {
    zapOptions.unshift(native);
  }

  return {
    address: zap.zapAddress,
    router: zap.ammRouter,
    tokens: zapOptions,
  };
}

export const computePairAddress = (factoryAddress, pairInitHash, tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);
  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
    pairInitHash
  );
};

export const sortTokens = (tokenA, tokenB) => {
  if (tokenA === tokenB)
    throw new RangeError(`Zap: tokenA should not be equal to tokenB: ${tokenB}`);
  return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
};
