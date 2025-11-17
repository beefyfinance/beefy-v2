import type { Address, Chain, ChainFormatters } from 'viem';
import type { GasConfig } from '../config-types.ts';

export type ViemConfig<
  TChainId extends number,
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
  custom extends Record<string, unknown> | undefined = Record<string, unknown> | undefined,
> = Omit<Chain<formatters, custom>, 'id'> & { id: TChainId };

export type ChainConfig<
  TId extends string = string,
  TChainId extends number = number,
  TViemConfig extends ViemConfig<TChainId> | undefined = ViemConfig<TChainId> | undefined,
> = {
  id: TId;
  name: string;
  eol?: number;
  disabled?: boolean;
  chainId: TChainId;
  rpc: string[];
  explorerUrl: string;
  explorerAddressUrlTemplate?: string;
  explorerTokenUrlTemplate?: string;
  explorerTxUrlTemplate?: string;
  multicall3Address: Address;
  appMulticallContractAddress: string;
  native: {
    symbol: string;
    oracleId: string;
    decimals: number;
  };
  gas: GasConfig;
  stableCoins: string[];
  new?: boolean;
  brand?: {
    icon?: 'solid' | 'gradient';
    header?: 'solid' | 'gradient';
  };
  viem: TViemConfig;
};
