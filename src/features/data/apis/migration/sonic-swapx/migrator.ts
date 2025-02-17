import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import { type BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses';
import { toWei } from '../../../../../helpers/big-number';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { selectVaultStrategyAddress } from '../../../selectors/vaults';

const id = 'sonic-swapx';

function getStakingAddress(vault: VaultEntity, web3: Web3, state: BeefyState): Promise<string> {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = new web3.eth.Contract(Abi, strategyAddress);
  return strategy.methods.gauge().call();
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
  return new web3.eth.Contract(Abi, stakingAddress).methods.withdrawAllAndHarvest();
}

const Abi: AbiItem[] = [
  {
    inputs: [],
    name: 'gauge',
    outputs: [{ name: '', type: 'address' }],
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
  {
    inputs: [],
    name: 'withdrawAllAndHarvest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
