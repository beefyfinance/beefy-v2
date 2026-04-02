import icon from '../../../../../images/single-assets/CNC.png?url';
import type { Address } from 'viem';
import { ConicLpTokenStakerAbi } from '../../../../../config/abi/ConicLpTokenStakerAbi.ts';
import { bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type { VaultEntity } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { fetchContract, fetchWalletContract } from '../../rpc-contract/viem-contract.ts';
import type { Migrator, MigratorUnstakeProps } from '../migration-types.ts';
import { buildExecute, buildUpdate } from '../utils.ts';
import type { BuildUnstakeCallParams, UnstakeCallFn } from '../utils-types.ts';

const id = 'ethereum-conic';
const CONIC_LP_TOKEN_STAKER = '0xA5241560306298efb9ed80b87427e664FFff0CF9';

async function getBalance(
  vault: VaultEntity,
  walletAddress: string,
  state: BeefyState
): Promise<string> {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const lpTokenStakerContract = fetchContract(
    CONIC_LP_TOKEN_STAKER,
    ConicLpTokenStakerAbi,
    vault.chainId
  );
  const lpContract = fetchContract(depositToken.address, ConicLpTokenStakerAbi, vault.chainId);

  const conicPoolAddress = await lpContract.read.minter();
  const balance = await lpTokenStakerContract.read.getUserBalanceForPool([
    conicPoolAddress,
    walletAddress as Address,
  ]);

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

  const lpContract = fetchContract(depositToken.address, ConicLpTokenStakerAbi, vault.chainId);
  const conicPoolAddress = await lpContract.read.minter();

  const lpStaker = fetchWalletContract(CONIC_LP_TOKEN_STAKER, ConicLpTokenStakerAbi, walletClient);
  const amountInWei = toWei(balance, depositToken.decimals);

  return (args: MigratorUnstakeProps) =>
    lpStaker.write.unstake([bigNumberToBigInt(amountInWei), conicPoolAddress], args);
}

export const migrator: Migrator<typeof id> = {
  id,
  name: 'Conic Finance',
  icon,
  update: buildUpdate(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
