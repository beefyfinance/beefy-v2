import type { Abi, Address } from 'viem';
import type BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectVaultStrategyAddress } from '../../../selectors/vaults.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildFetchBalance } from '../utils.ts';

const id = 'ethereum-curve';

const convexBooster = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';

async function getStakingAddress(vault: VaultEntity, state: BeefyState): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategyContract = fetchContract(strategyAddress, abi, vault.chainId);
  let gauge = ZERO_ADDRESS;
  try {
    gauge = await strategyContract.read.gauge();
  } catch {
    // old convex-only strat, get gauge by pid from booster
    try {
      const pid = await strategyContract.read.pid();
      const res = await fetchContract(convexBooster, abi, vault.chainId).read.poolInfo([pid]);
      gauge = res[2];
    } catch (err) {
      console.error(id, vault.name, 'migrator cant find gauge', err);
    }
  }
  return gauge;
}

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, state);
  if (stakingAddress === ZERO_ADDRESS) return '0';
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
  const walletClient = await (await getWalletConnectionApi()).getConnectedViemClient();
  const contract = fetchWalletContract(stakingAddress, abi, walletClient);
  return (args: MigratorUnstakeProps) =>
    contract.write.withdraw([bigNumberToBigInt(amountInWei)], args);
}

const abi = [
  {
    inputs: [],
    name: 'gauge',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pid',
    outputs: [{ name: '', type: 'uint' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'poolInfo',
    outputs: [
      {
        name: 'lptoken',
        type: 'address',
      },
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'gauge',
        type: 'address',
      },
      {
        name: 'crvRewards',
        type: 'address',
      },
      {
        name: 'stash',
        type: 'address',
      },
      {
        name: 'shutdown',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
