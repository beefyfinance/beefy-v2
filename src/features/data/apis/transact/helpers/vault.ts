import BigNumber from 'bignumber.js';
import { toWei } from '../../../../../helpers/big-number';
import { InputTokenAmount } from '../transact-types';
import { VaultStandard } from '../../../entities/vault';
import { BeefyState } from '../../../../../redux-types';
import Web3 from 'web3';
import { MultiCall } from 'eth-multicall';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../selectors/tokens';
import { selectUserBalanceOfToken } from '../../../selectors/balance';
import { selectVaultPricePerFullShare } from '../../../selectors/vaults';
import { selectFeesByVaultId } from '../../../selectors/fees';
import { VaultAbi } from '../../../../../config/abi';

export function getVaultWithdrawnFromState(
  userInput: InputTokenAmount,
  vault: VaultStandard,
  state: BeefyState,
  userAddress?: string
) {
  const withdrawAll = userInput.max;
  const withdrawnToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const requestedAmountWei = toWei(userInput.amount, withdrawnToken.decimals);
  const shareToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
  const totalSharesWei = toWei(
    selectUserBalanceOfToken(state, shareToken.chainId, shareToken.address, userAddress),
    shareToken.decimals
  );
  const ppfs = selectVaultPricePerFullShare(state, vault.id);
  const vaultFees = selectFeesByVaultId(state, vault.id);
  const withdrawFee = vaultFees.withdraw;

  let sharesToWithdrawWei = totalSharesWei; // max
  if (!withdrawAll) {
    // try to round up, so we withdraw at least the requested amount
    sharesToWithdrawWei = requestedAmountWei.dividedBy(ppfs).decimalPlaces(0, BigNumber.ROUND_CEIL);
    if (sharesToWithdrawWei.gt(totalSharesWei)) {
      sharesToWithdrawWei = totalSharesWei;
    }
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
  userAddress: string,
  web3: Web3,
  multicall: MultiCall
) {
  const withdrawAll = userInput.max;
  const withdrawnToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const requestedAmountWei = toWei(userInput.amount, withdrawnToken.decimals);
  const shareToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
  const vaultContract = new web3.eth.Contract(VaultAbi, vault.earnContractAddress);
  const vaultFees = selectFeesByVaultId(state, vault.id);
  const withdrawFee = vaultFees.withdraw;

  type MulticallReturnType = [
    [
      {
        balance: string;
        totalSupply: string;
        userBalance: string;
      }
    ]
  ];

  const [[vaultData]]: MulticallReturnType = (await multicall.all([
    [
      {
        balance: vaultContract.methods.balance(),
        totalSupply: vaultContract.methods.totalSupply(),
        userBalance: vaultContract.methods.balanceOf(userAddress),
      },
    ],
  ])) as MulticallReturnType;

  const totalSharesWei = new BigNumber(vaultData.userBalance);
  const vaultTotalSupplyWei = new BigNumber(vaultData.totalSupply);
  const vaultBalanceWei = new BigNumber(vaultData.balance);

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
