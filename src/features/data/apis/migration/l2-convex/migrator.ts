import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses';

const id = 'l2-convex';

const convexVoterProxy = '0x989AEb4d175e16225E39E87d0D97A3360524AD80';
const crvFactory = '0xabC000d88f23Bb45525E447528DBF656A9D55bf5';

async function getStakingAddress(vault: VaultEntity, web3: Web3, _: BeefyState): Promise<string> {
  const factory = new web3.eth.Contract(CurveAbi, crvFactory);
  const gauge = await factory.methods.get_gauge_from_lp_token(vault.depositTokenAddress).call();
  if (gauge == ZERO_ADDRESS) return gauge;
  const Gauge = new web3.eth.Contract(CurveAbi, gauge);
  return Gauge.methods.rewards_receiver(convexVoterProxy).call();
}

async function getBalance(
  vault: VaultEntity,
  web3: Web3,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, web3, state);
  if (stakingAddress == ZERO_ADDRESS) return '0';
  const staking = new web3.eth.Contract(ERC20Abi as unknown as AbiItem[], stakingAddress);
  return staking.methods.balanceOf(walletAddress).call();
}

async function unstakeCall(vault: VaultEntity, web3: Web3, _: BigNumber, state: BeefyState) {
  const stakingAddress = await getStakingAddress(vault, web3, state);
  const convexStaking = new web3.eth.Contract(ConvexAbi, stakingAddress);
  return convexStaking.methods.withdrawAll(true);
}

const CurveAbi: AbiItem[] = [
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
];

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
