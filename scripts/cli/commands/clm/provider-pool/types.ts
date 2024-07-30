import { Address } from 'viem';
import { CowcentratedStrategyId } from '../../../lib/config/strategy-type';
import { AddressBookChainId } from '../../../../common/config';

export type FeeTier = number | 'Dynamic';
export type FetchFeeTierFn = (
  chainId: AddressBookChainId,
  poolAddress: Address
) => Promise<FeeTier>;

export type ProviderPoolConfig = {
  strategyTypeId?: CowcentratedStrategyId;
  feeTier: FeeTier | FetchFeeTierFn;
};

type ProviderPoolBase = {
  address: Address;
  feeTier: FeeTier;
};

export type ProviderPool = ProviderPoolBase & Omit<ProviderPoolConfig, keyof ProviderPoolBase>;
