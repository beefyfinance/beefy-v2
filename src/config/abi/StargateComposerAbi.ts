import type { Abi } from 'viem';

export const StargateComposerAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_stargateBridge', type: 'address' },
      { internalType: 'address', name: '_stargateRouter', type: 'address' },
      { internalType: 'address', name: '_stargateEthVault', type: 'address' },
      { internalType: 'uint256', name: '_wethPoolId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint16', name: 'chainId', type: 'uint16' },
      { indexed: false, internalType: 'bytes', name: 'srcAddress', type: 'bytes' },
      { indexed: false, internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { indexed: false, internalType: 'bytes', name: 'reason', type: 'bytes' },
    ],
    name: 'CachedSwapSaved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'address', name: 'intendedReceiver', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amountLD', type: 'uint256' },
    ],
    name: 'ComposedTokenTransferFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_poolId', type: 'uint256' },
      { internalType: 'uint256', name: '_amountLD', type: 'uint256' },
      { internalType: 'address', name: '_to', type: 'address' },
    ],
    name: 'addLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'addLiquidityETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_srcChainId', type: 'uint16' },
      { internalType: 'bytes', name: '_srcAddress', type: 'bytes' },
      { internalType: 'uint64', name: '_nonce', type: 'uint64' },
      { internalType: 'address', name: '_receiver', type: 'address' },
      { internalType: 'bytes', name: '_sgReceiveCallData', type: 'bytes' },
    ],
    name: 'clearCachedSwap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_poolId', type: 'uint256' }],
    name: 'getPoolInfo',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'address', name: 'poolAddress', type: 'address' },
          { internalType: 'uint256', name: 'convertRate', type: 'uint256' },
        ],
        internalType: 'struct StargateComposer.PoolInfo',
        name: 'poolInfo',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_srcPoolId', type: 'uint16' },
      { internalType: 'uint256', name: '_amountLP', type: 'uint256' },
      { internalType: 'address', name: '_to', type: 'address' },
    ],
    name: 'instantRedeemLocal',
    outputs: [{ internalType: 'uint256', name: 'amountSD', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isSending',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '', type: 'uint16' },
      { internalType: 'bytes', name: '', type: 'bytes' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'payloadHashes',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    name: 'peers',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'poolIdToInfo',
    outputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'poolAddress', type: 'address' },
      { internalType: 'uint256', name: 'convertRate', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_chainId', type: 'uint16' },
      { internalType: 'uint8', name: '_functionType', type: 'uint8' },
      { internalType: 'bytes', name: '_toAddress', type: 'bytes' },
      { internalType: 'bytes', name: '_transferAndCallPayload', type: 'bytes' },
      {
        components: [
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'dstNativeAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'dstNativeAddr', type: 'bytes' },
        ],
        internalType: 'struct IStargateRouter.lzTxObj',
        name: '_lzTxParams',
        type: 'tuple',
      },
    ],
    name: 'quoteLayerZeroFee',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'recoverToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
      { internalType: 'uint256', name: '_srcPoolId', type: 'uint256' },
      { internalType: 'uint256', name: '_dstPoolId', type: 'uint256' },
      { internalType: 'address payable', name: '_refundAddress', type: 'address' },
      { internalType: 'uint256', name: '_amountLP', type: 'uint256' },
      { internalType: 'bytes', name: '_to', type: 'bytes' },
      {
        components: [
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'dstNativeAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'dstNativeAddr', type: 'bytes' },
        ],
        internalType: 'struct IStargateRouter.lzTxObj',
        name: '_lzTxParams',
        type: 'tuple',
      },
    ],
    name: 'redeemLocal',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
      { internalType: 'uint256', name: '_srcPoolId', type: 'uint256' },
      { internalType: 'uint256', name: '_dstPoolId', type: 'uint256' },
      { internalType: 'address payable', name: '_refundAddress', type: 'address' },
      { internalType: 'uint256', name: '_amountLP', type: 'uint256' },
      { internalType: 'uint256', name: '_minAmountLD', type: 'uint256' },
      { internalType: 'bytes', name: '_to', type: 'bytes' },
      {
        components: [
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'dstNativeAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'dstNativeAddr', type: 'bytes' },
        ],
        internalType: 'struct IStargateRouter.lzTxObj',
        name: '_lzTxParams',
        type: 'tuple',
      },
    ],
    name: 'redeemRemote',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
      { internalType: 'uint256', name: '_srcPoolId', type: 'uint256' },
      { internalType: 'uint256', name: '_dstPoolId', type: 'uint256' },
      { internalType: 'address payable', name: '_refundAddress', type: 'address' },
    ],
    name: 'sendCredits',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_dstGasReserve', type: 'uint256' }],
    name: 'setDstGasReserve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_chainId', type: 'uint16' },
      { internalType: 'address', name: '_peer', type: 'address' },
    ],
    name: 'setPeer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_poolId', type: 'uint256' },
      { internalType: 'address', name: '_stargateEthVault', type: 'address' },
    ],
    name: 'setStargateEthVaults',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_transferOverhead', type: 'uint256' }],
    name: 'setTransferOverhead',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_wethPoolId', type: 'uint256' }],
    name: 'setWethPoolId',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_srcChainId', type: 'uint16' },
      { internalType: 'bytes', name: '_srcAddress', type: 'bytes' },
      { internalType: 'uint256', name: '_nonce', type: 'uint256' },
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'uint256', name: '_amountLD', type: 'uint256' },
      { internalType: 'bytes', name: '_payload', type: 'bytes' },
    ],
    name: 'sgReceive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stargateBridge',
    outputs: [{ internalType: 'contract IStargateBridge', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'stargateEthVaults',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stargateRouter',
    outputs: [{ internalType: 'contract IStargateRouter', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
      { internalType: 'uint256', name: '_srcPoolId', type: 'uint256' },
      { internalType: 'uint256', name: '_dstPoolId', type: 'uint256' },
      { internalType: 'address payable', name: '_refundAddress', type: 'address' },
      { internalType: 'uint256', name: '_amountLD', type: 'uint256' },
      { internalType: 'uint256', name: '_minAmountLD', type: 'uint256' },
      {
        components: [
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'dstNativeAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'dstNativeAddr', type: 'bytes' },
        ],
        internalType: 'struct IStargateRouter.lzTxObj',
        name: '_lzTxParams',
        type: 'tuple',
      },
      { internalType: 'bytes', name: '_to', type: 'bytes' },
      { internalType: 'bytes', name: '_payload', type: 'bytes' },
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint16', name: '_dstChainId', type: 'uint16' },
      { internalType: 'address payable', name: '_refundAddress', type: 'address' },
      { internalType: 'bytes', name: '_to', type: 'bytes' },
      {
        components: [
          { internalType: 'uint256', name: 'amountLD', type: 'uint256' },
          { internalType: 'uint256', name: 'minAmountLD', type: 'uint256' },
        ],
        internalType: 'struct StargateComposer.SwapAmount',
        name: '_swapAmount',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'dstGasForCall', type: 'uint256' },
          { internalType: 'uint256', name: 'dstNativeAmount', type: 'uint256' },
          { internalType: 'bytes', name: 'dstNativeAddr', type: 'bytes' },
        ],
        internalType: 'struct IStargateRouter.lzTxObj',
        name: '_lzTxParams',
        type: 'tuple',
      },
      { internalType: 'bytes', name: '_payload', type: 'bytes' },
    ],
    name: 'swapETHAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wethPoolId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;
