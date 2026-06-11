import type { Address } from 'viem';
import BigNumber from 'bignumber.js';
import { StandardVaultAbi } from '../../../../../config/abi/StandardVaultAbi.ts';
import { toWei } from '../../../../../helpers/big-number.ts';
import type { VaultStandard, VaultWithPricePerFullShare } from '../../../entities/vault.ts';
import { selectFeesByVaultId } from '../../../selectors/fees.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectVaultPricePerFullShare } from '../../../selectors/vaults.ts';
import type { BeefyState } from '../../../store/types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { InputTokenAmount } from '../transact-types.ts';

/** Estimate the deposit-token amount withdrawn for a share-denominated input, using state ppfs */
export function getVaultSharesWithdrawnFromState(
  userInput: InputTokenAmount,
  vault: VaultWithPricePerFullShare,
  state: BeefyState
) {
  const withdrawAll = userInput.max;
  const withdrawnToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const shareToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const sharesToWithdrawWei = toWei(userInput.amount, shareToken.decimals);
  const ppfs = selectVaultPricePerFullShare(state, vault.id);
  const vaultFees = selectFeesByVaultId(state, vault.id);
  const withdrawFee = vaultFees?.withdraw || 0;

  const withdrawnAmountWei = sharesToWithdrawWei
    .multipliedBy(ppfs)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  const withdrawnAmountFeeWei = withdrawnAmountWei
    .multipliedBy(withdrawFee)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  const withdrawnAmountAfterFeeWei = withdrawnAmountWei.minus(withdrawnAmountFeeWei);

  return {
    withdrawAll,
    sharesToWithdrawWei,
    withdrawnAmountWei,
    withdrawnAmountAfterFeeWei,
    withdrawnToken,
    shareToken,
  };
}

/** Estimate the deposit-token amount withdrawn for a share-denominated input, using contract balance/totalSupply */
export async function getVaultSharesWithdrawnFromContract(
  userInput: InputTokenAmount,
  vault: VaultStandard,
  state: BeefyState,
  userAddress: string
) {
  const withdrawAll = userInput.max;
  const withdrawnToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const shareToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const vaultContract = fetchContract(vault.contractAddress, StandardVaultAbi, vault.chainId);
  const vaultFees = selectFeesByVaultId(state, vault.id);
  const withdrawFee = vaultFees?.withdraw || 0;

  const [balance, totalSupply, userShares] = await Promise.all([
    vaultContract.read.balance(),
    vaultContract.read.totalSupply(),
    vaultContract.read.balanceOf([userAddress as Address]),
  ]);
  const vaultTotalSupplyWei = new BigNumber(totalSupply.toString(10));
  const vaultBalanceWei = new BigNumber(balance.toString(10));
  const userSharesWei = new BigNumber(userShares.toString(10));

  // max means the live on-chain balance; typed amounts fail here rather than reverting after signing
  const sharesToWithdrawWei =
    withdrawAll ? userSharesWei : toWei(userInput.amount, shareToken.decimals);
  if (!withdrawAll && sharesToWithdrawWei.gt(userSharesWei)) {
    throw new Error('Withdrawal amount exceeds current share balance');
  }

  const withdrawnAmountWei = sharesToWithdrawWei
    .multipliedBy(vaultBalanceWei)
    .dividedToIntegerBy(vaultTotalSupplyWei);
  const withdrawnAmountFeeWei = withdrawnAmountWei
    .multipliedBy(withdrawFee)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  const withdrawnAmountAfterFeeWei = withdrawnAmountWei.minus(withdrawnAmountFeeWei);

  return {
    withdrawAll,
    sharesToWithdrawWei,
    withdrawnAmountWei,
    withdrawnAmountAfterFeeWei,
    withdrawnToken,
    shareToken,
  };
}
