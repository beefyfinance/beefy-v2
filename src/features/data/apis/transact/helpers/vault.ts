import { BigNumber } from 'bignumber.js';
import { toWei } from '../../../../../helpers/big-number';
import type { InputTokenAmount } from '../transact-types';
import type { VaultStandard } from '../../../entities/vault';
import type { BeefyState } from '../../../../../redux-types';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../selectors/tokens';
import { selectUserBalanceOfToken } from '../../../selectors/balance';
import { selectVaultPricePerFullShare } from '../../../selectors/vaults';
import { selectFeesByVaultId } from '../../../selectors/fees';
import { StandardVaultAbi } from '../../../../../config/abi/StandardVaultAbi';
import { fetchContract } from '../../rpc-contract/viem-contract';
import type { Address } from 'abitype';

export function getVaultWithdrawnFromState(
  userInput: InputTokenAmount,
  vault: VaultStandard,
  state: BeefyState,
  userAddress?: string
) {
  const withdrawAll = userInput.max;
  const withdrawnToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const requestedAmountWei = toWei(userInput.amount, withdrawnToken.decimals);
  const shareToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const totalSharesWei = toWei(
    selectUserBalanceOfToken(state, shareToken.chainId, shareToken.address, userAddress),
    shareToken.decimals
  );
  const ppfs = selectVaultPricePerFullShare(state, vault.id);
  const vaultFees = selectFeesByVaultId(state, vault.id);
  const withdrawFee = vaultFees?.withdraw || 0;

  let sharesToWithdrawWei = totalSharesWei; // max
  if (!withdrawAll) {
    // try to round up, so we withdraw at least the requested amount
    sharesToWithdrawWei = requestedAmountWei.dividedBy(ppfs).decimalPlaces(0, BigNumber.ROUND_CEIL);
  }

  const withdrawnAmountWei = sharesToWithdrawWei
    .multipliedBy(ppfs)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  const withdrawnAmountFeeWei = withdrawnAmountWei
    .multipliedBy(withdrawFee)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  const withdrawnAmountAfterFeeWei = withdrawnAmountWei.minus(withdrawnAmountFeeWei);

  return {
    withdrawAll, // user wants to withdraw all
    requestedAmountWei, // what user typed in the box
    sharesToWithdrawWei, // how many shares to withdraw
    withdrawnAmountWei, // how much of the deposit token will be withdrawn (before fee)
    withdrawnAmountAfterFeeWei, // how much of the deposit token will be withdrawn (after fee)
    withdrawnToken,
    shareToken,
  };
}

export async function getVaultWithdrawnFromContract(
  userInput: InputTokenAmount,
  vault: VaultStandard,
  state: BeefyState,
  userAddress: string
) {
  const withdrawAll = userInput.max;
  const withdrawnToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const requestedAmountWei = toWei(userInput.amount, withdrawnToken.decimals);
  const shareToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const vaultContract = fetchContract(vault.contractAddress, StandardVaultAbi, vault.chainId);

  const vaultFees = selectFeesByVaultId(state, vault.id);
  const withdrawFee = vaultFees?.withdraw || 0;

  const [balance, totalSupply, userBalance] = await Promise.all([
    vaultContract.read.balance(),
    vaultContract.read.totalSupply(),
    vaultContract.read.balanceOf([userAddress as Address]),
  ]);

  const totalSharesWei = new BigNumber(userBalance.toString(10));
  const vaultTotalSupplyWei = new BigNumber(totalSupply.toString(10));
  const vaultBalanceWei = new BigNumber(balance.toString(10));

  let sharesToWithdrawWei = totalSharesWei; // max
  if (!withdrawAll) {
    // try to round up, so we withdraw at least the requested amount
    sharesToWithdrawWei = requestedAmountWei
      .multipliedBy(vaultTotalSupplyWei)
      .dividedBy(vaultBalanceWei)
      .decimalPlaces(0, BigNumber.ROUND_CEIL);
    if (sharesToWithdrawWei.gt(totalSharesWei)) {
      sharesToWithdrawWei = totalSharesWei;
    }
  }

  const withdrawnAmountWei = sharesToWithdrawWei
    .multipliedBy(vaultBalanceWei)
    .dividedToIntegerBy(vaultTotalSupplyWei);
  const withdrawnAmountFeeWei = withdrawnAmountWei
    .multipliedBy(withdrawFee)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  const withdrawnAmountAfterFeeWei = withdrawnAmountWei.minus(withdrawnAmountFeeWei);

  return {
    withdrawAll, // user wants to withdraw all
    requestedAmountWei, // what user typed in the box
    sharesToWithdrawWei, // how many shares to withdraw
    withdrawnAmountWei, // how much of the deposit token will be withdrawn (before fee)
    withdrawnAmountAfterFeeWei, // how much of the deposit token will be withdrawn (after fee)
    withdrawnToken,
    shareToken,
  };
}
