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
import { ZERO_ADDRESS } from '../../../../../helpers/addresses';

const id = 'ethereum-curve';

const convexBooster = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31';

async function getStakingAddress(
  vault: VaultEntity,
  web3: Web3,
  state: BeefyState
): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = new web3.eth.Contract(ABI, strategyAddress);
  let gauge = ZERO_ADDRESS;
  try {
    gauge = await strategy.methods.gauge().call();
  } catch {
    // old convex-only strat, get gauge by pid from booster
    try {
      const pid = await strategy.methods.pid().call();
      const res = await new web3.eth.Contract(ABI, convexBooster).methods.poolInfo(pid).call();
      gauge = res.gauge;
    } catch (err) {
      console.error(id, vault.name, 'migrator cant find gauge', err);
    }
  }
  return gauge;
}

async function getBalance(
  vault: VaultEntity,
  web3: Web3,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, web3, state);
  if (stakingAddress == ZERO_ADDRESS) return '0';
  const staking = new web3.eth.Contract(ERC20Abi as unknown as AbiItem, stakingAddress);
  return staking.methods.balanceOf(walletAddress).call();
}

async function unstakeCall(vault: VaultEntity, web3: Web3, amount: BigNumber, state: BeefyState) {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const stakingAddress = await getStakingAddress(vault, web3, state);
  const curveGauge = new web3.eth.Contract(ABI, stakingAddress);
  return curveGauge.methods.withdraw(amountInWei.toString(10));
}

const ABI: AbiItem[] = [
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
];

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
