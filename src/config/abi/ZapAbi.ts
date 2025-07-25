import type { Abi } from 'viem';

export const ZapAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'beefyVault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenAmountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'tokenIn',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenInAmount',
        type: 'uint256',
      },
    ],
    name: 'beefIn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'beefyVault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenAmountOutMin',
        type: 'uint256',
      },
    ],
    name: 'beefInETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'beefyVault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'withdrawAmount',
        type: 'uint256',
      },
    ],
    name: 'beefOut',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'beefyVault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'withdrawAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'desiredToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'desiredTokenOutMin',
        type: 'uint256',
      },
    ],
    name: 'beefOutAndSwap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'checkWETH',
    outputs: [
      {
        internalType: 'bool',
        name: 'isValid',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'beefyVault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenIn',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'fullInvestmentIn',
        type: 'uint256',
      },
    ],
    name: 'estimateSwap',
    outputs: [
      {
        internalType: 'uint256',
        name: 'swapAmountIn',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'swapAmountOut',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'swapTokenOut',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IBeefyVault',
        name: 'beefyVault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'desiredToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'withdrawAmount',
        type: 'uint256',
      },
    ],
    name: 'estimateSwapOut',
    outputs: [
      {
        internalType: 'uint256',
        name: 'swapAmountIn',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'swapAmountOut',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'swapTokenIn',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'minimumAmount',
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
    name: 'router',
    outputs: [
      {
        internalType: 'contract IUniswapV2Router02',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const satisfies Abi;
