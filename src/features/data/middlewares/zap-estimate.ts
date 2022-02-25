import { isArray } from 'lodash';
import { BeefyStore } from '../../../redux-types';
import { fetchEstimateZapDeposit, fetchEstimateZapWithdraw } from '../actions/zap';
import { ChainEntity } from '../entities/chain';

// fetch balance and allowance again
export function zapEstimateMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: { chainId?: ChainEntity['id'] } }) => {
    const depositBefore = store.getState().ui.deposit;
    const withdrawBefore = store.getState().ui.withdraw;
    await next(action);
    const depositAfter = store.getState().ui.deposit;
    const withdrawAfter = store.getState().ui.withdraw;

    // start a zap estimation if needed
    if (
      depositAfter.isZap &&
      (depositBefore.vaultId !== depositAfter.vaultId ||
        depositBefore.selectedToken.id !== depositAfter.selectedToken.id ||
        !depositBefore.amount.isEqualTo(depositAfter.amount))
    ) {
      store.dispatch(
        fetchEstimateZapDeposit({
          vaultId: depositAfter.vaultId,
          inputTokenId: depositAfter.selectedToken.id,
        })
      );
    }

    if (
      withdrawAfter.isZap &&
      !isArray(withdrawAfter.selectedToken) &&
      // when exiting on both LP tokens, no estimate is done
      (withdrawBefore.vaultId !== withdrawAfter.vaultId ||
        (!isArray(withdrawBefore.selectedToken) &&
          withdrawBefore.selectedToken.id !== withdrawAfter.selectedToken.id) ||
        isArray(withdrawBefore.selectedToken) ||
        !withdrawBefore.amount.isEqualTo(withdrawAfter.amount))
    ) {
      store.dispatch(
        fetchEstimateZapWithdraw({
          vaultId: withdrawAfter.vaultId,
          outputTokenId: withdrawAfter.selectedToken.id,
        })
      );
    }
  };
}
