import { Address, getAddress, isAddressEqual, parseAbiItem, PublicClient } from 'viem';
import { Strategy, StrategyConfig } from './types';
import { getBeaconProxyImplementationAddress } from '../../../utils/proxy';
import { Abi, AbiFunction } from 'abitype/src/abi';
import { pConsole } from '../../../utils/console';

const strategyRewardPoolAbi = {
  inputs: [],
  name: 'rewardPool',
  outputs: [{ internalType: 'address', name: '', type: 'address' }],
  stateMutability: 'view',
  type: 'function',
} as const;

type StrategyRewardPoolAbi = Array<typeof strategyRewardPoolAbi>;

function isAbiFunction(item: Abi[number]): item is AbiFunction {
  return item.type === 'function';
}

export function isRewardPoolStrategy(
  strategy: Strategy
): strategy is Strategy<StrategyRewardPoolAbi> {
  const rewardPoolFunction = strategy.config.abi
    .filter(isAbiFunction)
    .find(item => item.name === 'rewardPool');
  if (!rewardPoolFunction) {
    return false;
  }
  const { inputs, outputs } = rewardPoolFunction;
  return (!inputs || inputs.length === 0) && outputs?.length === 1 && outputs[0].type === 'address';
}

async function importConfig(type: string) {
  try {
    const module = await import(`./${type}`);
    return module.default as StrategyConfig;
  } catch (e) {
    throw new Error(`Strategy config not found for ${type}`, { cause: e });
  }
}

export async function getStrategy(
  client: PublicClient,
  strategyAddress: Address
): Promise<Strategy> {
  const [factoryAddress, implementationAddress] = await Promise.all([
    client.readContract({
      address: strategyAddress,
      functionName: 'factory',
      abi: [parseAbiItem('function factory() public view returns (address)')],
    }),
    getBeaconProxyImplementationAddress(client, strategyAddress),
  ]);

  const strategyTypes = await client.readContract({
    address: factoryAddress,
    functionName: 'getStrategyTypes',
    abi: [parseAbiItem('function getStrategyTypes() public view returns (string[])')],
  });

  if (!strategyTypes.length) {
    throw new Error('No strategy types found');
  }

  const strategyImplementationAddresses = await Promise.all(
    strategyTypes.map((strategyType: string) =>
      client.readContract({
        address: factoryAddress,
        functionName: 'getImplementation',
        abi: [parseAbiItem('function getImplementation(string) public view returns (address)')],
        args: [strategyType],
      })
    )
  );

  if (strategyImplementationAddresses.length !== strategyTypes.length) {
    throw new Error('Not all strategy types have an implementation');
  }

  const strategyImplementations = strategyTypes.map((strategyType, index) => {
    const typeMatch = strategyType.match(/^(?<base>.*)_V(?<version>\d+)$/);
    if (!typeMatch || !typeMatch.groups || !typeMatch.groups.base || !typeMatch.groups.version) {
      throw new Error(`Invalid strategy type ${strategyType}, expected format <base>_V<version>`);
    }

    return {
      address: getAddress(strategyImplementationAddresses[index]),
      type: strategyType,
      base: typeMatch.groups.base,
      version: parseInt(typeMatch.groups.version, 10),
    };
  });

  const implementation = strategyImplementations.find(implementation =>
    isAddressEqual(implementation.address, implementationAddress)
  );
  if (!implementation) {
    console.table(strategyImplementations);
    throw new Error(
      `Strategy implementation ${implementationAddress} not found in factory ${factoryAddress}`
    );
  }

  const newerImplementations = strategyImplementations
    .filter(other => other.version > implementation.version && other.base === implementation.base)
    .sort((a, b) => b.version - a.version);
  if (newerImplementations.length) {
    pConsole.warn(`Newer version(s) of ${implementation.type} found:`);
    console.table(newerImplementations);
  }

  const config = await importConfig(implementation.type);

  return {
    address: getAddress(strategyAddress),
    implementation,
    config,
  };
}
