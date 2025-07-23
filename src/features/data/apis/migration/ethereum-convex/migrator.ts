import type { Abi, Address } from 'viem';
import type BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectVaultStrategyAddress } from '../../../selectors/vaults.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildFetchBalance } from '../utils.ts';

const id = 'ethereum-convex';

function getStakingAddress(vault: VaultEntity, state: BeefyState): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = fetchContract(strategyAddress, ConvexStrategyAbi, vault.chainId);
  if (vault.assetIds.length === 1) {
    if (vault.assetIds[0] === 'cvxCRV') {
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

async function unstakeCall(
  vault: VaultEntity,
  amount: BigNumber,
  state: BeefyState
): Promise<(args: MigratorUnstakeProps) => Promise<Hash>> {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const stakingAddress = await getStakingAddress(vault, state);
  const walletApi = await getWalletConnectionApi();
  const walletClient = await walletApi.getConnectedViemClient();
  const contract = fetchWalletContract(stakingAddress, ConvexAbi, walletClient);

  if (vault.assetIds.length === 1) {
    if (vault.assetIds[0] === 'CVX') {
      return (args: MigratorUnstakeProps) =>
        contract.write.withdraw([bigNumberToBigInt(amountInWei), false], args);
    }
    return (args: MigratorUnstakeProps) =>
      contract.write.withdraw([bigNumberToBigInt(amountInWei)], args);
  } else {
    return (args: MigratorUnstakeProps) => contract.write.withdrawAllAndUnwrap([true], args);
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

const ConvexAbi = [
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
] as const satisfies Abi;

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
