import type { Abi, Address } from 'viem';
import type BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { ERC20Abi } from '../../../../../config/abi/ERC20Abi.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildFetchBalance } from '../utils.ts';

const id = 'l2-curve';

const crvFactory = (chainId: ChainEntity['id']) =>
  chainId === 'fraxtal' ?
    '0xeF672bD94913CB6f1d2812a6e18c1fFdEd8eFf5c'
  : '0xabC000d88f23Bb45525E447528DBF656A9D55bf5';

const override: Record<string, string> = {
  'spell-mim-crv': '0x6d2070b13929Df15B13D96cFC509C574168988Cd',
};

async function getStakingAddress(vault: VaultEntity, _: BeefyState): Promise<string> {
  if (vault.id in override) return override[vault.id];
  const factory = fetchContract(crvFactory(vault.chainId) as Address, CurveAbi, vault.chainId);
  return factory.read.get_gauge_from_lp_token([vault.depositTokenAddress as Address]);
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
  const contract = fetchWalletContract(stakingAddress, CurveAbi, walletClient);
  return (args: MigratorUnstakeProps) =>
    contract.write.withdraw([bigNumberToBigInt(amountInWei)], args);
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
    inputs: [{ name: '', type: 'uint256' }],
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
