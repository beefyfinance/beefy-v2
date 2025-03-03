import type { ChainId } from '../../entities/chain';
import type { Address } from 'viem';

export type AllChainsFromTldToChain<T extends Record<string, ChainId[]>> = {
  [K in keyof T]: T[K] extends (infer U)[] ? U : never;
}[keyof T];

export type DomainToAddressFn = (domain: string, chainId: ChainId) => Promise<Address | undefined>;

export type AddressToDomainFn = (address: Address, chainId: ChainId) => Promise<string | undefined>;

export type Resolver = {
  tldToChain: () => Promise<Record<string, ChainId[]>>;
  methods: () => Promise<{
    domainToAddress: DomainToAddressFn;
    addressToDomain: AddressToDomainFn;
  }>;
};
