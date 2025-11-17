import type { ChainConfig } from './config-types.ts';
import { freezeArray } from '../../utils/array-utils.ts';
import { defineChain } from 'viem';
import { config } from '../../../../config/config.ts';
import { uniq } from 'lodash-es';
import type { BuiltChain, BuiltChains } from './viem-types.ts';

function buildChain<const TInput extends ChainConfig>(input: TInput) {
  return defineChain({
    id: input.chainId,
    name: input.name,
    nativeCurrency: {
      decimals: input.native.decimals,
      name: input.native.symbol,
      symbol: input.native.symbol,
    },
    rpcUrls: {
      default: { http: input.rpc },
    },
    blockExplorers: {
      default: { name: `${input.name} Explorer`, url: input.explorerUrl },
    },
    contracts: {
      multicall3: {
        address: input.multicall3Address,
      },
    },
  } satisfies TInput['viem']);
}

function buildChains<const TInputs extends readonly [ChainConfig, ...ChainConfig[]]>(
  chains: TInputs
) {
  return freezeArray(
    chains.map(input => {
      const baseChain = (input.viem || buildChain(input)) satisfies ChainConfig['viem'];
      return {
        ...baseChain,
        rpcUrls: {
          ...baseChain.rpcUrls,
          default: {
            ...baseChain.rpcUrls.default,
            http: uniq([...input.rpc, ...baseChain.rpcUrls.default.http]),
          },
        },
        beefy: {
          transport: {
            retryCount: input.eol ? 1 : 3,
            retryDelay: 350,
            timeout: 10000,
            multicall: {
              batchSize: 1024,
              wait: 250,
            },
          },
        },
      } satisfies BuiltChain;
    })
  ) as BuiltChains<TInputs>;
}

/** list of viem chains */
export const viemChains = buildChains(config);
