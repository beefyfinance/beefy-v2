export interface BridgeInfoEntity {
  address: string;
  chainId: string;
  decimals: number;
  liquidityType: string;
  logoUrl: string;
  name: string;
  price: number;
  symbol: string;
  underlying: UnderlyingEntity | false;
  destChains: DestChainEntity[];
}

export interface UnderlyingEntity {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
}

export interface DestChainEntity {
  BaseFeePercent?: number;
  BigValueThreshold: number | string; //If type  === UNDERLYINGV2 this values come from api in string
  DepositAddress?: string;
  routerToken?: string;
  MaximumSwap: number | string; //If type  === UNDERLYINGV2 this values come from api in string
  MaximumSwapFee: number | string; //If type  === UNDERLYINGV2 this values come from api in string
  MinimumSwap: number | string; //If type  === UNDERLYINGV2 this values come from api in string
  MinimumSwapFee: number | string; //If type  === UNDERLYINGV2 this values come from api in string
  SwapFeeRatePerMillion: number;
  address: string;
  decimals: number;
  isDisabled: boolean;
  liquidityType: string;
  name: string;
  pairid?: string;
  swapfeeon: number;
  symbol: string;
  type: 'swapout' | 'swapin' | 'UNDERLYINGV2';
  underlying?: UnderlyingEntity | false;
}
