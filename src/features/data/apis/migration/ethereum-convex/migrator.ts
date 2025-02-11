import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { selectVaultStrategyAddress } from '../../../selectors/vaults';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi';
import { toWei } from '../../../../../helpers/big-number';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Abi, Address } from 'abitype';

const id = 'ethereum-convex';

function getStakingAddress(vault: VaultEntity, state: BeefyState): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = fetchContract(strategyAddress, ConvexStrategyAbi, vault.chainId);
  if (vault.assetIds.length === 1) {
    if (vault.assetIds[0] == 'cvxCRV') {
      return strategy.read.stakedCvxCrv();
    } else {
      return strategy.read.staking();
    }
  } else {
    return strategy.read.rewardPool();
  }
}

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, state);
  const stakingContract = fetchContract(stakingAddress, ERC20Abi, vault.chainId);
  const walletBalance = await stakingContract.read.balanceOf([walletAddress as Address]);
  return walletBalance.toString(10);
}

async function unstakeCall(vault: VaultEntity, web3: Web3, amount: BigNumber, state: BeefyState) {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const stakingAddress = await getStakingAddress(vault, state);
  const convexStaking = new web3.eth.Contract(ConvexAbi, stakingAddress);

  if (vault.assetIds.length === 1) {
    if (vault.assetIds[0] == 'CVX') {
      return convexStaking.methods.withdraw(amountInWei.toString(10), false);
    }
    return convexStaking.methods.withdraw(amountInWei.toString(10));
  } else {
    return convexStaking.methods.withdrawAllAndUnwrap(true);
  }
}

const ConvexStrategyAbi = [
  {
    inputs: [],
    name: 'stakedCvxCrv',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'staking',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardPool',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

const ConvexAbi: AbiItem[] = [
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'bool', name: 'claim', type: 'bool' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bool', name: 'claim', type: 'bool' }],
    name: 'withdrawAllAndUnwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
