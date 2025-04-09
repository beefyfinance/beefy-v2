import type BigNumber from 'bignumber.js';
import type { Hex } from 'viem';

export type Token = {
  name: string;
  symbol: string;
  decimals: number;
  token_price: TokenPrice;
};

export type TokenPrice = {
  usd: number;
};

export type GasPriceInUnits = {
  value: string;
  decimals: number;
};

export type NativeToken = Token & {
  contract_address: string;
  gas_price: string;
  gas_price_gwei: string;
  gas_price_in_units: GasPriceInUnits;
};

export type NativeTokenL2 = NativeToken & {
  l1_gas_price: string;
  l1_gas_price_gwei: string;
  l1_gas_price_in_units: GasPriceInUnits;
  l1_fee_scalar: number;
  l1_gas_oracle_address: string;
};

export type SourceToken = NativeToken;

export type DestinationToken = NativeToken | NativeTokenL2;

export type ExpressFee = {
  relayer_fee: number;
  relayer_fee_usd: number;
  express_gas_overhead_fee: number;
  express_gas_overhead_fee_usd: number;
  total: number;
  total_usd: number;
};

export type L2Type = 'op' | 'arb' | 'mantle' | undefined;

export type GetFeesResult = {
  base_fee: number;
  base_fee_usd: number;
  execute_gas_multiplier: number;
  execute_min_gas_price: string;
  source_base_fee: number;
  source_base_fee_string: string;
  source_base_fee_usd: number;
  destination_base_fee: number;
  destination_base_fee_string: string;
  destination_base_fee_usd: number;
  source_confirm_fee: number;
  destination_confirm_fee: number;
  express_supported: boolean;
  express_fee: number;
  express_fee_string: string;
  express_fee_usd: number;
  express_execute_gas_multiplier: number;
  source_express_fee: ExpressFee;
  destination_express_fee: ExpressFee;
  source_token: SourceToken;
  destination_native_token: DestinationToken;
  l2_type?: L2Type;
  axelar_token: Token;
  ethereum_token: Token;
};

export type EstimateL1FeeParams = {
  l2Type: L2Type;
  l1GasOracleAddress: string;
  executeData: Hex;
  l1GasPrice: GasPriceInUnits;
  destChain: AxelarChain;
};

/** @see https://github.com/axelarnetwork/axelarjs-sdk/blob/main/src/constants/EvmChain.ts */
export type AxelarChain =
  | 'ethereum'
  | 'avalanche'
  | 'fantom'
  | 'polygon'
  | 'polygon-zkevm'
  | 'moonbeam'
  | 'aurora'
  | 'binance'
  | 'arbitrum'
  | 'celo'
  | 'kava'
  | 'base'
  | 'filecoin'
  | 'optimism'
  | 'linea'
  | 'mantle'
  | 'scroll'
  | 'fraxtal'
  | 'blast';

/** @see https://github.com/axelarnetwork/axelarjs-sdk/blob/main/src/constants/GasToken.ts */
export type AxelarGasToken =
  | 'AVAX'
  | 'GLMR'
  | 'MATIC'
  | 'ETH'
  | 'FTM'
  | 'aETH'
  | 'BNB'
  | 'CELO'
  | 'KAVA'
  | 'FIL'
  | 'MNT'
  | 'frxETH';

export type GetFeesRequest = {
  destinationChain: AxelarChain;
  destinationContractAddress: string;
  method: 'getFees';
  sourceChain: AxelarChain;
  sourceContractAddress: string;
  sourceTokenSymbol: string;
};

type AxelarResponse<
  TRequest extends {
    method: string;
  },
  TResult,
> = {
  method: TRequest['method'];
  params: TRequest;
  result: TResult;
};

export type GetFeesResponse = AxelarResponse<GetFeesRequest, GetFeesResult>;

export interface IAxelarSDK {
  /** @returns fee in wei of the source chain's native token */
  estimateGasFee(
    sourceChainId: AxelarChain,
    sourceContractAddress: string,
    sourceChainTokenSymbol: AxelarGasToken,
    destinationChainId: AxelarChain,
    destinationContractAddress: string,
    gasLimit: BigNumber,
    executeData: string,
    gasMultiplier: number | 'auto',
    /** in wei */
    minDestinationGasPriceWei: BigNumber
  ): Promise<BigNumber>;
}
