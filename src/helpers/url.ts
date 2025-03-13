import type { ChainEntity } from '../features/data/entities/chain.ts';

export function explorerTokenUrl(chain: ChainEntity, tokenAddress: string) {
  return chain.explorerTokenUrlTemplate.replace('{address}', tokenAddress);
}

export function explorerAddressUrl(chain: ChainEntity, address: string) {
  return chain.explorerAddressUrlTemplate.replace('{address}', address);
}

export function explorerTxUrl(chain: ChainEntity, txHash: string) {
  return chain.explorerTxUrlTemplate.replace('{hash}', txHash);
}
