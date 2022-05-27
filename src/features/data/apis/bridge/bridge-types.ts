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

export interface TxDataRes {
  msg: string;
  info?: Info;
  error?: string;
}
export interface Info {
  pairid: string;
  txid: string;
  txto: string;
  txheight: number;
  txtime: string;
  from: string;
  to: string;
  bind: string;
  value: string;
  swaptx: string;
  swapheight: number;
  swaptime: string;
  swapvalue: string;
  swaptype: number;
  swapnonce: number;
  status: 3 | 8 | 9 | 10 | 12 | 14; //3=ExceedLimit(LessThenMinAmount)/8 = Confirming/9 = Swapping/10 = Success/12 = BigAmount(Wait24Hours)/14 = Failure/
  statusmsg: string;
  timestamp: number;
  memo: string;
  swapinfo: Swapinfo;
  confirmations: number;
  srcChainID: string;
  destChainID: string;
  historyType: string;
  formatswapvalue: string;
  formatvalue: string;
  formatfee: number;
  time: string;
  fromChainID: string;
  toChainID: string;
  logIndex: number;
  label: string;
}
export interface Swapinfo {
  routerSwapInfo: RouterSwapInfo;
}
export interface RouterSwapInfo {
  token: string;
  tokenID: string;
}
