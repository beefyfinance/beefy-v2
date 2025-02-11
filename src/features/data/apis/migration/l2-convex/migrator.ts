import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses';
import type { ChainEntity } from '../../../entities/chain';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Abi, Address } from 'abitype';

const id = 'l2-convex';

const convexVoterProxy = '0x989AEb4d175e16225E39E87d0D97A3360524AD80';
const crvFactory = (chainId: ChainEntity['id']) =>
  chainId === 'fraxtal'
    ? '0xeF672bD94913CB6f1d2812a6e18c1fFdEd8eFf5c'
    : '0xabC000d88f23Bb45525E447528DBF656A9D55bf5';

async function getStakingAddress(vault: VaultEntity, _: BeefyState): Promise<string> {
  const factory = fetchContract(crvFactory(vault.chainId) as Address, CurveAbi, vault.chainId);
  const gaugeAddress = await factory.read.get_gauge_from_lp_token([
    vault.depositTokenAddress as Address,
  ]);
  if (gaugeAddress == ZERO_ADDRESS) return gaugeAddress;
  const gaugeContract = fetchContract(gaugeAddress, CurveAbi, vault.chainId);
  return gaugeContract.read.rewards_receiver([convexVoterProxy]);
}

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, state);
  if (stakingAddress == ZERO_ADDRESS) return '0';
  const stakingContract = fetchContract(stakingAddress, ERC20Abi, vault.chainId);
  const walletBalance = await stakingContract.read.balanceOf([walletAddress as Address]);
  return walletBalance.toString(10);
}

async function unstakeCall(vault: VaultEntity, web3: Web3, _: BigNumber, state: BeefyState) {
  const stakingAddress = await getStakingAddress(vault, state);
  const convexStaking = new web3.eth.Contract(ConvexAbi, stakingAddress);
  return convexStaking.methods.withdrawAll(true);
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

const ConvexAbi: AbiItem[] = [
  {
    inputs: [{ name: 'claim', type: 'bool' }],
    name: 'withdrawAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
