import { GlpLikeConfig, UnlockTimeResult } from './types';
import { AbiItem } from 'web3-utils';
import { ChainEntity } from '../../../../../data/entities/chain';
import { getWeb3Instance } from '../../../../../data/apis/instances';
import { MultiCall } from 'eth-multicall';
import { BigNumber } from 'bignumber.js';

const stakedAbiCache: Record<string, AbiItem[]> = {};

function getStakedAbi(config: GlpLikeConfig): AbiItem[] {
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
    ];
  }

  return stakedAbiCache[config.managerMethod];
}

const managerAbi: AbiItem[] = [
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
];

export async function getUnlockTime(
  depositTokenAddress: string,
  userAddress: string,
  chain: ChainEntity,
  config: GlpLikeConfig
): Promise<UnlockTimeResult> {
  const web3 = await getWeb3Instance(chain);
  const multicall = new MultiCall(web3, chain.multicallAddress);
  const stakedContract = new web3.eth.Contract(getStakedAbi(config), depositTokenAddress);
  const [[addresses]] = (await multicall.all([
    [
      {
        manager: stakedContract.methods[config.managerMethod](),
      },
    ],
  ])) as [[{ manager: string }]];

  const managerContract = new web3.eth.Contract(managerAbi, addresses.manager);
  const [[result]] = (await multicall.all([
    [
      {
        lastAddedAt: userAddress ? managerContract.methods.lastAddedAt(userAddress) : '0',
        cooldownDuration: managerContract.methods.cooldownDuration(),
      },
    ],
  ])) as [[{ lastAddedAt: string; cooldownDuration: string }]];

  const lastAddedAt = new BigNumber(result.lastAddedAt || '0').multipliedBy(1000).toNumber();
  const cooldownDuration = new BigNumber(result.cooldownDuration || '0')
    .multipliedBy(1000)
    .toNumber();

  return {
    unlocksAt: lastAddedAt + cooldownDuration,
    cooldownDuration,
  };
}
