import type { GlpLikeConfig, UnlockTimeResult } from './types';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { BigNumber } from 'bignumber.js';
import { fetchContract } from '../../../../../data/apis/rpc-contract/viem-contract';
import type { Abi, Address } from 'abitype';

const stakedAbiCache: Record<string, Abi> = {};

function getStakedAbi(config: GlpLikeConfig): Abi {
  if (!(config.managerMethod in stakedAbiCache)) {
    stakedAbiCache[config.managerMethod] = [
      {
        inputs: [],
        name: config.managerMethod,
        outputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const satisfies Abi;
  }

  return stakedAbiCache[config.managerMethod];
}

const managerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastAddedAt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cooldownDuration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export async function getUnlockTime(
  depositTokenAddress: string,
  userAddress: string | undefined,
  chain: ChainEntity,
  config: GlpLikeConfig
): Promise<UnlockTimeResult> {
  const stakedContract = fetchContract(depositTokenAddress, getStakedAbi(config), chain.id);
  // dynamic abi screws up with type inference so we make it explicit
  const manager = (await stakedContract.read[config.managerMethod]()) as Address;

  const managerContract = fetchContract(manager, managerAbi, chain.id);
  const [lastAddedAtResult, cooldownDurationResult] = await Promise.all([
    userAddress ? managerContract.read.lastAddedAt([userAddress as Address]) : 0n,
    managerContract.read.cooldownDuration(),
  ]);

  const lastAddedAt = new BigNumber(lastAddedAtResult?.toString(10) || '0')
    .multipliedBy(1000)
    .toNumber();
  const cooldownDuration = new BigNumber(cooldownDurationResult?.toString(10) || '0')
    .multipliedBy(1000)
    .toNumber();

  return {
    unlocksAt: lastAddedAt + cooldownDuration,
    cooldownDuration,
  };
}
