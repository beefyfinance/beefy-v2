import { Abi, Address } from 'viem';
import { AddressBookChainId } from '../../../../common/config';

export type FetchTokenProviderFn = (
  chainId: AddressBookChainId,
  strategyAddress: Address,
  vaultReceiptName: string
) => Promise<string | undefined>;

export type StrategyConfig<TAbi extends Abi = Abi> = {
  tokenProviderId?: string | FetchTokenProviderFn;
  abi: TAbi;
};

export type StrategyImplementation = {
  address: Address;
  type: string;
  base: string;
  version: number;
};

export type Strategy<TAbi extends Abi = Abi> = {
  address: Address;
  implementation: StrategyImplementation;
  config: StrategyConfig<TAbi>;
};
