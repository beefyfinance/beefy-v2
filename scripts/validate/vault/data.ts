import { AddressBookChainId, chainRpcs, getVaultsForChain } from '../../common/config';
import partition from 'lodash/partition';
import Web3 from 'web3';
import { MultiCall } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import { StandardVaultAbi } from '../../../src/config/abi/StandardVaultAbi';
import type { AbiItem } from 'web3-utils';
import { withRetries } from '../../common/utils';
import strategyABI from '../../../src/config/abi/strategy.json';
import { createCachedFactory } from '../../common/factory';
import { groupBy } from 'lodash';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../src/config/abi/BeefyCowcentratedLiquidityVaultAbi';
import { ZERO_ADDRESS } from '../../../src/helpers/addresses';
import { BeefyOracleAbi } from '../../common/abi/BeefyOracleAbi';
import {
  CowcentratedOracleData,
  CowcentratedVaultData,
  CowcentratedWithData,
  GovWithData,
  RewardPoolData,
  StandardWithData,
  StrategyData,
  VaultData,
  VaultGroups,
} from './data-types';
import {
  VaultConfigsByType,
  VaultCowcentratedConfig,
  VaultGovConfig,
  VaultStandardConfig,
} from './config-types';
import { pconsole } from '../../common/pconsole';

function merge<A, B>(a: A, b: B): A & B {
  return { ...a, ...b };
}

const getWeb3 = createCachedFactory(
  (chainId: AddressBookChainId) => new Web3(chainRpcs[chainId]),
  chainId => chainId
);

const getMultiCall = createCachedFactory(
  (chainId: AddressBookChainId) =>
    new MultiCall(getWeb3(chainId), addressBook[chainId].platforms.beefyfinance.multicall),
  chainId => chainId
);

export async function fetchVaults(chainId: AddressBookChainId): Promise<VaultGroups> {
  const configs = await getVaultsForChain(chainId);
  const byType = groupBy(configs, vault => vault.type || 'standard') as VaultConfigsByType;
  const [allStandard, allGov, allCowcentrated] = await Promise.all([
    fetchStandard(chainId, byType.standard || []),
    fetchGovs(chainId, byType.gov || []),
    fetchCowcentrated(chainId, byType.cowcentrated || []),
  ]);
  const clmAddresses = new Set(allCowcentrated.map(vault => vault.earnContractAddress));
  const [cowcentratedStandard, baseStandard] = partition(
    allStandard,
    pool => pool.tokenAddress && clmAddresses.has(pool.tokenAddress)
  );
  const [cowcentratedGov, baseGov] = partition(
    allGov,
    pool => pool.tokenAddress && clmAddresses.has(pool.tokenAddress)
  );

  const vaults: VaultGroups = {
    all: [...allStandard, ...allGov, ...allCowcentrated],
    allStandard,
    allGov,
    allCowcentrated,
    cowcentratedGov,
    baseGov,
    cowcentratedStandard,
    baseStandard,
  };

  return vaults;
}

async function fetchGovs(
  chainId: AddressBookChainId,
  configs: VaultGovConfig[]
): Promise<GovWithData[]> {
  if (configs.length === 0) {
    return [];
  }
  const datas = await fetchRewardPoolData(
    chainId,
    configs.map(config => config.earnContractAddress)
  );
  return configs.map((config, i) => merge(config, datas[i]));
}

const fetchRewardPoolData = makeDataFetcher<RewardPoolData>(
  'reward pool',
  StandardVaultAbi as unknown as AbiItem[],
  {
    rewardPoolOwner: { method: 'owner' },
    totalSupply: { method: 'totalSupply' },
  }
);

async function fetchStandard(
  chainId: AddressBookChainId,
  configs: VaultStandardConfig[]
): Promise<StandardWithData[]> {
  if (configs.length === 0) {
    return [];
  }
  const vaultDatas = await fetchStandardVaultData(
    chainId,
    configs.map(config => config.earnContractAddress)
  );
  const strategyDatas = await fetchStrategyData(
    chainId,
    vaultDatas.map(vault => vault.strategy)
  );
  return configs.map((config, i) => merge(merge(config, vaultDatas[i]), strategyDatas[i]));
}

const fetchStandardVaultData = makeDataFetcher<VaultData>(
  'vault',
  StandardVaultAbi as unknown as AbiItem[],
  {
    strategy: { method: 'strategy' },
    vaultOwner: { method: 'owner' },
    totalSupply: { method: 'totalSupply' },
    vaultWant: { method: 'want' },
  }
);

const fetchStrategyData = makeDataFetcher<StrategyData>('strategy', strategyABI as AbiItem[], {
  keeper: { method: 'keeper' },
  feeRecipient: { method: 'beefyFeeRecipient' },
  beefyFeeConfig: { method: 'beefyFeeConfig' },
  strategyOwner: { method: 'owner' },
  harvestOnDeposit: { method: 'harvestOnDeposit' },
});

async function fetchCowcentrated(
  chainId: AddressBookChainId,
  configs: VaultCowcentratedConfig[]
): Promise<CowcentratedWithData[]> {
  if (configs.length === 0) {
    return [];
  }
  const beefyOracleAddress = addressBook[chainId].platforms.beefyfinance.beefyOracle;
  if (!beefyOracleAddress) {
    throw new Error(`Missing Beefy Oracle address for chain ${chainId}`);
  }
  const vaultDatas = await fetchCowcentratedVaultData(
    chainId,
    configs.map(config => config.earnContractAddress)
  );
  const [strategyDatas, cowcentratedDatas] = await Promise.all([
    fetchStrategyData(
      chainId,
      vaultDatas.map(vault => vault.strategy)
    ),
    fetchCowcentratedOracleData(
      chainId,
      vaultDatas.map(vaultData => ({
        address: beefyOracleAddress,
        wants: vaultData.wants,
      }))
    ),
  ]);

  return configs.map((config, i) =>
    merge(merge(merge(config, vaultDatas[i]), strategyDatas[i]), cowcentratedDatas[i])
  );
}

const fetchCowcentratedVaultData = makeDataFetcher<CowcentratedVaultData>(
  'cowcentrated vault',
  BeefyCowcentratedLiquidityVaultAbi as unknown as AbiItem[],
  {
    strategy: { method: 'strategy' },
    vaultOwner: { method: 'owner' },
    totalSupply: { method: 'totalSupply' },
    wants: { method: 'wants' },
    vaultWant: { method: 'want' },
  }
);

type FetchCowcentratedOracleDataInput = DataInputBaseObject & { wants: [string, string] };
const fetchCowcentratedOracleData = makeDataFetcher<
  CowcentratedOracleData,
  FetchCowcentratedOracleDataInput
>('cowcentrated oracle', BeefyOracleAbi as unknown as AbiItem[], {
  subOracle0: { method: 'subOracle', args: input => [input.wants[0]] },
  subOracle1: { method: 'subOracle', args: input => [input.wants[1]] },
  subOracle0FromZero: { method: 'subOracle', args: input => [ZERO_ADDRESS, input.wants[0]] },
  subOracle1FromZero: { method: 'subOracle', args: input => [ZERO_ADDRESS, input.wants[1]] },
});

type DataInputBaseObject = {
  address: string;
};
type DataInput = string | DataInputBaseObject;
type DataArgsFn<TInput extends DataInput = string> = (input: TInput) => any[];
type DataArgs<TInput extends DataInput = string> = DataArgsFn<TInput> | any[];
type DataCalls<TData extends Record<string, unknown>, TInput extends DataInput = string> = {
  [K in keyof TData]: { method: string; args?: DataArgs<TInput> };
};

function makeDataFetcher<TData extends Record<string, unknown>, TInput extends DataInput = string>(
  name: string,
  abi: AbiItem[],
  dataCalls: DataCalls<TData, TInput>
) {
  const keys = Object.keys(dataCalls);

  return async function (
    chainId: AddressBookChainId,
    inputs: TInput[],
    retries = 5
  ): Promise<TData[]> {
    try {
      const web3 = getWeb3(chainId);
      const multicall = getMultiCall(chainId);

      const calls = inputs.map(input => {
        const contract = new web3.eth.Contract(
          abi,
          typeof input === 'string' ? input : input.address
        );
        return Object.fromEntries(
          keys.map(key => {
            const call = dataCalls[key];
            const args = typeof call.args === 'function' ? call.args(input) : call.args || [];
            if (!contract.methods[call.method]) {
              throw new Error(`Method ${call.method} not found in abi for ${name}`);
            }
            return [key, contract.methods[call.method](...args)];
          })
        );
      });

      return withRetries(
        async () => {
          const [results] = await multicall.all([calls]);

          return inputs.map((_, i) => {
            return Object.fromEntries(
              keys.map(key => {
                return [key, results[i][key]];
              })
            ) as TData;
          });
        },
        {
          delay: 1_000,
          retries,
          onRetry: (e, attempt) => {
            pconsole.warn(
              `Retrying ${chainId} ${name} data fetch (${attempt + 1}/${retries}), ${e.message}`
            );
          },
        }
      );
    } catch (e) {
      throw new Error(`Failed to fetch ${name} data for ${chainId}`, { cause: e });
    }
  };
}
