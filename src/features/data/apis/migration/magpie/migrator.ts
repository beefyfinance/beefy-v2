import type { Abi, Address } from 'viem';
import type BigNumber from 'bignumber.js';
import type { Hash } from 'viem';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { getWalletConnectionApi } from '../../instances.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildFetchBalance } from '../utils.ts';

const id = 'magpie';

const poolHelpers: Partial<Record<ChainEntity['id'], string>> = {
  ethereum: '0x1C1Fb35334290b5ff1bF7B4c09130885b10Fc0f4',
  arbitrum: '0xc06a5d3014b9124Bf215287980305Af2f793eB30',
};

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  _: BeefyState
): Promise<string> {
  const poolHelper = poolHelpers[vault.chainId];
  if (!poolHelper) return '0';
  const walletBalance = await fetchContract(poolHelper, PoolHelperAbi, vault.chainId).read.balance([
    vault.depositTokenAddress as Address,
    walletAddress as Address,
  ]);
  return walletBalance.toString(10);
}

async function unstakeCall(
  vault: VaultEntity,
  amount: BigNumber,
  state: BeefyState
): Promise<(args: MigratorUnstakeProps) => Promise<Hash>> {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const poolHelper = poolHelpers[vault.chainId];
  if (!poolHelper) throw new Error('No pool helper found for chain');
  const walletClient = await (await getWalletConnectionApi()).getConnectedViemClient();
  const contract = fetchWalletContract(poolHelper, PoolHelperAbi, walletClient);
  return (args: MigratorUnstakeProps) =>
    contract.write.withdrawMarketWithClaim(
      [vault.depositTokenAddress as Address, bigNumberToBigInt(amountInWei), true],
      args
    );
}

const PoolHelperAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_market', type: 'address' },
      { internalType: 'address', name: '_address', type: 'address' },
    ],
    name: 'balance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_market', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'bool', name: '_doClaim', type: 'bool' },
    ],
    name: 'withdrawMarketWithClaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
