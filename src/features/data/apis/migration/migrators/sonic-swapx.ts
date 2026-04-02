import icon from '../../../../../images/single-assets/SWPx.svg?url';
import type { Abi, Address } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectVaultStrategyAddress } from '../../../selectors/vaults.ts';
import type { BeefyState } from '../../../store/types.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildUpdate } from '../utils.ts';
import type { BuildUnstakeCallParams, UnstakeCallFn } from '../utils-types.ts';

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

async function unstakeCall({
  vault,
  getState,
  walletClient,
}: BuildUnstakeCallParams): Promise<UnstakeCallFn> {
  const stakingAddress = await getStakingAddress(vault, getState());
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

export const migrator: Migrator<typeof id> = {
  id,
  name: 'SwapX',
  icon,
  update: buildUpdate(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
