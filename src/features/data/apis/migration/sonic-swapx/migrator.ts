import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types.ts';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { buildExecute, buildFetchBalance } from '../utils.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { selectVaultStrategyAddress } from '../../../selectors/vaults.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi, Address } from 'abitype';
import { getWalletConnectionApi } from '../../instances.ts';
import type { Hash } from 'viem';

const id = 'sonic-swapx';

function getStakingAddress(vault: VaultEntity, state: BeefyState) {
  const strategyAddress = selectVaultStrategyAddress(state, vault.id);
  const strategy = fetchContract(strategyAddress, abi, vault.chainId);
  return strategy.read.gauge();
}

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const stakingAddress = await getStakingAddress(vault, state);
  if (stakingAddress === ZERO_ADDRESS) return '0';
  const staking = fetchContract(stakingAddress, ERC20Abi, vault.chainId);
  const balance = await staking.read.balanceOf([walletAddress as Address]);
  return balance.toString(10);
}

async function unstakeCall(
  vault: VaultEntity,
  _amount: BigNumber,
  state: BeefyState
): Promise<(args: MigratorUnstakeProps) => Promise<Hash>> {
  const stakingAddress = await getStakingAddress(vault, state);
  const walletApi = await getWalletConnectionApi();
  const walletClient = await walletApi.getConnectedViemClient();
  const walletContract = fetchWalletContract(stakingAddress, abi, walletClient);

  return (args: MigratorUnstakeProps) => walletContract.write.withdrawAllAndHarvest(args);
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
    name: 'withdrawAllAndHarvest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
