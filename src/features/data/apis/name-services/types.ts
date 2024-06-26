import type { ChainId } from '../../entities/chain';
import type Web3 from 'web3';
import type { Address } from 'viem';

export type AllChainsFromTldToChain<T extends Record<string, ChainId[]>> = {
  [K in keyof T]: T[K] extends (infer U)[] ? U : never;
}[keyof T];

export type DomainToAddressFn = (
  domain: string,
  chainId: ChainId,
  web3: Web3
) => Promise<Address | undefined>;

export type AddressToDomainFn = (
  address: Address,
  chainId: ChainId,
  web3: Web3
) => Promise<string | undefined>;

export type Resolver = {
  tldToChain: () => Promise<Record<string, ChainId[]>>;
  methods: () => Promise<{
    domainToAddress: DomainToAddressFn;
    addressToDomain: AddressToDomainFn;
  }>;
};
