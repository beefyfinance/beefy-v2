import type { Abi, Address } from 'viem';
import type BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildFetchBalance } from '../utils.ts';

const id = 'l2-convex';

const convexVoterProxy = '0x989AEb4d175e16225E39E87d0D97A3360524AD80';
const crvFactory = (chainId: ChainEntity['id']) =>
  chainId === 'fraxtal' ?
    '0xeF672bD94913CB6f1d2812a6e18c1fFdEd8eFf5c'
  : '0xabC000d88f23Bb45525E447528DBF656A9D55bf5';

async function getStakingAddress(vault: VaultEntity, _: BeefyState): Promise<string> {
  const factory = fetchContract(crvFactory(vault.chainId) as Address, CurveAbi, vault.chainId);
  const gaugeAddress = (await factory.read.get_gauge_from_lp_token([
    vault.depositTokenAddress as Address,
  ])) as string;
  if (gaugeAddress === ZERO_ADDRESS) return gaugeAddress;
  const gaugeContract = fetchContract(gaugeAddress, CurveAbi, vault.chainId);
  return gaugeContract.read.rewards_receiver([convexVoterProxy]) as Promise<string>;
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
  _: BigNumber,
  state: BeefyState
): Promise<(args: MigratorUnstakeProps) => Promise<Hash>> {
  const stakingAddress = await getStakingAddress(vault, state);
  const walletClient = await (await getWalletConnectionApi()).getConnectedViemClient();
  const contract = fetchWalletContract(stakingAddress, ConvexAbi, walletClient);
  return (args: MigratorUnstakeProps) => contract.write.withdrawAll([true], args);
}

const CurveAbi = [
  {
    inputs: [{ name: 'lp', type: 'address' }],
    name: 'get_gauge_from_lp_token',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'rewards_receiver',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

const ConvexAbi = [
  {
    inputs: [{ name: 'claim', type: 'bool' }],
    name: 'withdrawAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
