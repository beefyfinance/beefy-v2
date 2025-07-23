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

const id = 'real-pearl';

function getStakingAddress(vault: VaultEntity, state: BeefyState): Promise<string> {
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
  const walletBalance = await staking.read.balanceOf([walletAddress as Address]);
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
