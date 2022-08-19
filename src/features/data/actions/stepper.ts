import { isEmpty } from '../../../helpers/utils';
import { BeefyStore } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { stepperActions } from '../reducers/wallet/stepper';
import { selectSteperState } from '../selectors/stepper';
import { selectWalletActions } from '../selectors/wallet-actions';

export async function startStepper(store: BeefyStore, chainId: ChainEntity['id']) {
  store.dispatch(stepperActions.setChainId({ chainId }));
  store.dispatch(stepperActions.updateCurrentStepIndex({ stepIndex: 0 }));
  store.dispatch(stepperActions.setModal({ modal: true }));
  const walletActionsState = selectWalletActions(store.getState());
  const steps = selectSteperState(store.getState());
  for (let i = 0; i <= steps.items.length; i++) {
    if (!isEmpty(steps.items[i]) && steps.modal) {
      store.dispatch(stepperActions.updateCurrentStep({ index: steps.currentStep, pending: true }));
      await store.dispatch(steps.items[i].action);
    } else {
      if (walletActionsState.result === 'success' && steps.finished) {
        store.dispatch(stepperActions.setFinished({ finished: true }));
      }
    }
  }
}
