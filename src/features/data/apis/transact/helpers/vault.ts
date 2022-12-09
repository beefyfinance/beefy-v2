import { TokenEntity, TokenErc20 } from '../../../entities/token';
import BigNumber from 'bignumber.js';
import { toWei } from '../../../../../helpers/big-number';

export function getVaultWithdrawn(
  requestedDepositTokenAmountDecimal: BigNumber,
  withdrawnToken: TokenEntity,
  shareToken: TokenErc20,
  pricePerFullShareDecimal: BigNumber,
  withdrawFeeDecimal: number
) {
  const requestedDepositTokenAmountWei = toWei(
    requestedDepositTokenAmountDecimal,
    withdrawnToken.decimals
  );

  const shareAmountWei =
    requestedDepositTokenAmountWei.dividedToIntegerBy(pricePerFullShareDecimal);

  const withdrawnTokenAmountWei = shareAmountWei
    .multipliedBy(pricePerFullShareDecimal)
    .decimalPlaces(withdrawnToken.decimals, BigNumber.ROUND_FLOOR);

  const withdrawnTokenFeeWei = withdrawnTokenAmountWei
    .multipliedBy(withdrawFeeDecimal)
    .decimalPlaces(withdrawnToken.decimals, BigNumber.ROUND_FLOOR);

  const withdrawnTokenAmountAfterFeeWei = withdrawnTokenAmountWei.minus(withdrawnTokenFeeWei);

  return {
    withdrawnTokenAmountWei,
    withdrawnTokenAmountAfterFeeWei,
    shareAmountWei,
  };
}
