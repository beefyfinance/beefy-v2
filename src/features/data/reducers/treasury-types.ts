import type { ChainEntity } from '../entities/chain.ts';
import type { MarketMakerHoldingEntity, TreasuryHoldingEntity } from '../entities/treasury.ts';

export interface AddressHolding {
  address: string;
  name: string;
  balances: {
    [address: string]: TreasuryHoldingEntity;
  };
}

export interface ExchangeHolding {
  [tokenId: string]: MarketMakerHoldingEntity;
}

export type AddressHoldingByChainId = {
  [chainId in ChainEntity['id']]?: {
    [address: string]: AddressHolding;
  };
};

export type ExchangeHoldingByMarketMakerId = {
  [marketMakerId: string]: {
    [exchangeId: string]: ExchangeHolding;
  };
};

export interface TreasuryState {
  byChainId: AddressHoldingByChainId;
  byMarketMakerId: ExchangeHoldingByMarketMakerId;
}
