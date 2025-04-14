import type { Abi } from 'viem';

export const BeefyV2AppMulticallAbi = [
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'tokens',
        type: 'address[]',
      },
      {
        internalType: 'address[][]',
        name: 'spenders',
        type: 'address[][]',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getAllowances',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'allowances',
            type: 'uint256[]',
          },
        ],
        internalType: 'struct AllowanceInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'tokens',
        type: 'address[]',
      },
      {
        internalType: 'address[][]',
        name: 'spenders',
        type: 'address[][]',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getAllowancesFlat',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'boosts',
        type: 'address[]',
      },
    ],
    name: 'getBoostInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'totalSupply',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rewardRate',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'periodFinish',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isPreStake',
            type: 'bool',
          },
        ],
        internalType: 'struct BoostInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'boosts',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getBoostOrGovBalance',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'balance',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rewards',
            type: 'uint256',
          },
        ],
        internalType: 'struct BoostBalanceInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'vaults',
        type: 'address[]',
      },
    ],
    name: 'getCowVaultInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'token0Balance',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'token1Balance',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'strategy',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'paused',
            type: 'bool',
          },
        ],
        internalType: 'struct CowVaultInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'govVaults',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getGovVaultBalance',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'balance',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rewards',
            type: 'uint256',
          },
        ],
        internalType: 'struct GovVaultBalanceInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'govVaults',
        type: 'address[]',
      },
    ],
    name: 'getGovVaultInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'totalSupply',
            type: 'uint256',
          },
        ],
        internalType: 'struct GovVaultInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'vaults',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getGovVaultMultiBalance',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'balance',
            type: 'uint256',
          },
          {
            internalType: 'address[]',
            name: 'rewardTokens',
            type: 'address[]',
          },
          {
            internalType: 'uint256[]',
            name: 'rewards',
            type: 'uint256[]',
          },
        ],
        internalType: 'struct BoostBalanceInfoV2[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'govVaults',
        type: 'address[]',
      },
    ],
    name: 'getGovVaultMultiInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'totalSupply',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'rewardAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'rate',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'periodFinish',
                type: 'uint256',
              },
            ],
            internalType: 'struct RewardInfo[]',
            name: 'rewards',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct GovVaultMultiInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'tokens',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'getTokenBalances',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'vaults',
        type: 'address[]',
      },
    ],
    name: 'getVaultInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'balance',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'pricePerFullShare',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'strategy',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'paused',
            type: 'bool',
          },
        ],
        internalType: 'struct VaultInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    type: 'function',
    name: 'getERC4626VaultInfo',
    inputs: [
      {
        name: 'vaults',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct ERC4626VaultInfo[]',
        components: [
          {
            name: 'balance',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'pricePerFullShare',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'paused',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const satisfies Abi;
