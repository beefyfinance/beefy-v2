import type { ChainEntity } from '../entities/chain.ts';
import type { TreasuryHoldingEntity } from '../entities/treasury.ts';

export interface AddressHolding {
  address: string;
  name: string;
  balances: {
    [address: string]: TreasuryHoldingEntity;
  };
}

export type AddressHoldingByChainId = {
  [chainId in ChainEntity['id']]?: {
    [address: string]: AddressHolding;
  };
};

export interface TreasuryState {
  byChainId: AddressHoldingByChainId;
}
