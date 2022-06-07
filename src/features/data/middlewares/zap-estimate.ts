import { isArray } from 'lodash';
import { BeefyStore } from '../../../redux-types';
import { initiateDepositForm } from '../actions/deposit';
import { initiateWithdrawForm } from '../actions/withdraw';
import { fetchEstimateZapDeposit, fetchEstimateZapWithdraw } from '../actions/zap';
import { getEligibleZapOptions } from '../apis/zap';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { depositActions } from '../reducers/wallet/deposit';
import { withdrawActions } from '../reducers/wallet/withdraw';

// fetch balance and allowance again
export function zapEstimateMiddleware(store: BeefyStore) {
  return next =>
    async (action: {
      type: string;
      payload: { chainId?: ChainEntity['id'] };
      meta: { arg: { vaultId?: VaultEntity['id'] } };
    }) => {
      // compute eligible options when we reload the form
      if (action.type === initiateDepositForm.pending.type) {
        store.dispatch(
          depositActions.setZapOptions(
            getEligibleZapOptions(store.getState(), action.meta.arg.vaultId ?? null)
          )
        );
      }
      if (action.type === initiateWithdrawForm.pending.type) {
        store.dispatch(
          withdrawActions.setZapOptions(
            getEligibleZapOptions(store.getState(), action.meta.arg.vaultId ?? null)
          )
        );
      }

      const depositBefore = store.getState().ui.deposit;
      const withdrawBefore = store.getState().ui.withdraw;
      await next(action);
      const depositAfter = store.getState().ui.deposit;
      const withdrawAfter = store.getState().ui.withdraw;

      // recompute eligible zap options when addressbook gets loaded
      if (
        depositAfter.isZap &&
        (depositBefore.vaultId !== depositAfter.vaultId ||
          depositBefore.selectedToken.id !== depositAfter.selectedToken.id ||
          !depositBefore.amount.isEqualTo(depositAfter.amount))
      ) {
        // start a zap estimation if needed
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
