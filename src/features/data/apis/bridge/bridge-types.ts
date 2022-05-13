export interface anyTokenEntity {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
}

export interface destChainEntity {
  BigValueThreshold: string;
  MaximumSwap: string;
  MaximumSwapFee: string;
  MinimumSwap: string;
  MinimumSwapFee: string;
  SwapFeeRatePerMillion: number;
  address: string;
  anyToken: anyTokenEntity;
  liquidityType: string;
  swapfeeon: number;
  underlying: anyTokenEntity | null;
}

export interface brigeTokenDataEntity {
  address: string;
  anyToken: anyTokenEntity;
  chainId: string;
  destChains: destChainEntity[];
  logoUrl: string;
  price: number;
  router: string;
  routerABI: string;
  tokenid: string;
  underlying: anyTokenEntity | null;
  version: string;
}
