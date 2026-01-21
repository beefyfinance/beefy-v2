import icon from '../../../../../images/single-assets/PEARL.png?url';
import type { Address } from 'viem';
import { SolidlyGaugeAbi } from '../../../../../config/abi/SolidlyGaugeAbi.ts';
import { SolidlyVoterAbi } from '../../../../../config/abi/SolidlyVoterAbi.ts';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildUpdate } from '../utils.ts';
import type { BuildUnstakeCallParams, UnstakeCallFn } from '../utils-types.ts';

const id = 'polygon-pearl';
const PEARL_VOTER = '0xa26C2A6BfeC5512c13Ae9EacF41Cb4319d30cCF0';

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const voterContract = fetchContract(PEARL_VOTER, SolidlyVoterAbi, vault.chainId);
  const gaugeAddress = await voterContract.read.gauges([depositToken.address as Address]);
  const gaugeContract = fetchContract(gaugeAddress, SolidlyGaugeAbi, vault.chainId);
  const balance = await gaugeContract.read.balanceOf([walletAddress as Address]);
  return balance.toString(10);
}

async function unstakeCall({
  vault,
  data: { balance },
  getState,
  walletClient,
}: BuildUnstakeCallParams): Promise<UnstakeCallFn> {
  const state = getState();
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

  const voterContract = fetchContract(PEARL_VOTER, SolidlyVoterAbi, vault.chainId);
  const gaugeAddress = await voterContract.read.gauges([depositToken.address as Address]);

  const gaugeContract = fetchWalletContract(gaugeAddress, SolidlyGaugeAbi, walletClient);
  const amountInWei = toWei(balance, depositToken.decimals);

  return (args: MigratorUnstakeProps) =>
    gaugeContract.write.withdraw([bigNumberToBigInt(amountInWei)], args);
}

export const migrator: Migrator<typeof id> = {
  id,
  name: 'Pearl',
  icon,
  update: buildUpdate(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
