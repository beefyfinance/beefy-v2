import type { ChainEntity } from '../features/data/entities/chain';

export function explorerTokenUrl(chain: ChainEntity, tokenAddress: string) {
  return chain.explorerTokenUrlTemplate.replace('{address}', tokenAddress);
}

export function explorerAddressUrl(chain: ChainEntity, contractAddress: string) {
  return chain.explorerAddressUrlTemplate.replace('{address}', contractAddress);
}

export function explorerTxUrl(chain: ChainEntity, txHash: string) {
  return chain.explorerTxUrlTemplate.replace('{hash}', txHash);
}
