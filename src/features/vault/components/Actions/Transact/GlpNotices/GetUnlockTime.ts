import type { GlpLikeConfig, UnlockTimeResult } from './types.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import BigNumber from 'bignumber.js';
import { fetchContract } from '../../../../../data/apis/rpc-contract/viem-contract.ts';
import type { Abi, Address } from 'viem';
import { readContract } from 'viem/actions';
import { rpcClientManager } from '../../../../../data/apis/rpc-contract/rpc-manager.ts';

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
  const chainClients = rpcClientManager.getClients(chain.id);
  const manager = await readContract(chainClients.batchCallClient, {
    address: depositTokenAddress as Address,
    functionName: config.managerMethod,
    abi: [
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
      } as const,
    ] as const,
  });

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
