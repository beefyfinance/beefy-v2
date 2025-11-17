import type { ChainConfig } from './config-types.ts';
import type { Prettify } from 'viem';
import type { config } from '../../../../config/config.ts';

export type BuiltEntity<TInput extends ChainConfig = ChainConfig> = Omit<
  TInput,
  | 'chainId'
  | 'explorerTokenUrlTemplate'
  | 'explorerAddressUrlTemplate'
  | 'explorerTxUrlTemplate'
  | 'viem'
  | 'disabled'
  | 'new'
  | 'eol'
  | 'brand'
> & {
  networkChainId: TInput['chainId'];
  explorerTokenUrlTemplate: string;
  explorerAddressUrlTemplate: string;
  explorerTxUrlTemplate: string;
  disabled: boolean;
  new: boolean;
  eol: number;
  brand: {
    icon: 'solid' | 'gradient';
    header: 'solid' | 'gradient';
  };
};

export type BuiltEntities<TInputs extends readonly [ChainConfig, ...ChainConfig[]]> = {
  readonly [K in keyof TInputs]: BuiltEntity<TInputs[K]>;
} & { readonly length: TInputs['length'] };

export type ChainId = (typeof config)[number]['id'];

export type ChainEntity = Prettify<BuiltEntity<ChainConfig<ChainId>>>;
