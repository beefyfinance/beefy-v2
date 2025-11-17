import type { Chain, MulticallBatchOptions, Prettify } from 'viem';
import type { ChainConfig, ViemConfig } from './config-types.ts';

type ExtendChain<TChain extends Chain> = TChain & {
  beefy: {
    transport: {
      retryCount: number;
      retryDelay: number;
      timeout: number;
      multicall: boolean | Prettify<MulticallBatchOptions>;
    };
  };
};

export type BuiltChain<TInput extends ChainConfig = ChainConfig> = ExtendChain<
  TInput['viem'] extends Chain ? TInput['viem'] : ViemConfig<TInput['chainId']>
>;

export type BuiltChains<TInputs extends readonly [ChainConfig, ...ChainConfig[]]> = {
  readonly [K in keyof TInputs]: ExtendChain<ViemConfig<number /*TInputs[K]['chainId']*/>>;
} & { readonly length: TInputs['length'] };
