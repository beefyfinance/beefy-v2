import { BigNumber } from 'bignumber.js';
import { BeefyState } from '../../../redux-types';
import { formatBigDecimals } from '../../../helpers/format';
import { isTokenErc20 } from '../entities/token';
import { WalletActionsState } from '../reducers/wallet/wallet-action';
import { selectBridgeStatus } from './bridge';

export const selectSteperState = (state: BeefyState) => {
  return state.ui.stepperState;
};

export const selectSteperChainId = (state: BeefyState) => {
  return state.ui.stepperState.chainId;
};

export const selectIsStepperStepping = (state: BeefyState) => {
  return state.ui.stepperState.modal && !state.ui.stepperState.finished;
};

export const selectStepperFinished = (state: BeefyState) => {
  return state.ui.stepperState.finished;
};

export const selectStepperCurrentStep = (state: BeefyState) => {
  return state.ui.stepperState.currentStep;
};

export const selectStepperCurrentStepData = (state: BeefyState) => {
  const currentStep = state.ui.stepperState.currentStep;
  return state.ui.stepperState.items[currentStep];
};

export const selectStepperItems = (state: BeefyState) => {
  return state.ui.stepperState.items;
};

export function selectMintResult(walletActionsState: WalletActionsState) {
  const result = {
    type: 'mint',
    amount: formatBigDecimals(walletActionsState.data.amount, 2),
  };

  if (walletActionsState.result === 'success') {
    if (
      walletActionsState.data.receipt.events &&
      'Transfer' in walletActionsState.data.receipt.events &&
      isTokenErc20(walletActionsState.data.token)
    ) {
      const userAddress = walletActionsState.data.receipt.from.toLowerCase();
      const mintContractAddress = walletActionsState.data.receipt.to.toLowerCase();
      const mintToken = walletActionsState.data.token;
      const mintTokenAddress = mintToken.address.toLowerCase();
      const transferEvents = Array.isArray(walletActionsState.data.receipt.events['Transfer'])
        ? walletActionsState.data.receipt.events['Transfer']
        : [walletActionsState.data.receipt.events['Transfer']];
      for (const event of transferEvents) {
        // 1. Transfer of the minted token (BeFTM or binSPIRIT)
        // 2. Transfer to the user
        // 3. Transfer is not from the zap contract (like it would be for a mint)
        if (
          event.address.toLowerCase() === mintTokenAddress &&
          event.returnValues.to.toLowerCase() === userAddress &&
          event.returnValues.from.toLowerCase() !== mintContractAddress &&
          event.returnValues.from !== '0x0000000000000000000000000000000000000000'
        ) {
          result.type = 'buy';
          result.amount = formatBigDecimals(
            new BigNumber(event.returnValues.value).shiftedBy(-mintToken.decimals),
            2
          );
          break;
        }
      }
    }
  }

  return result;
}

export const selectIsProgressBar25 = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;
  const stepperItems = selectStepperItems(state);
  const currentStep = selectStepperCurrentStep(state);
  const currentStepData = selectStepperCurrentStepData(state);
  const totalSteps = stepperItems.length;
  const isBridgeStep = currentStepData?.step === 'bridge';

  return isBridgeStep
    ? totalSteps === 1 && walletActionsStateResult === 'success_pending'
    : totalSteps === 2 && currentStep === 0 && walletActionsStateResult === 'success_pending';
};

export const selectIsProgressBar50 = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;
  const stepperItems = selectStepperItems(state);
  const currentStep = selectStepperCurrentStep(state);
  const currentStepData = selectStepperCurrentStepData(state);
  const totalSteps = stepperItems.length;
  const isBridgeStep = currentStepData?.step === 'bridge';

  return (
    (isBridgeStep && totalSteps === 1 && walletActionsStateResult === 'success') ||
    (totalSteps === 1 && walletActionsStateResult === 'success_pending') ||
    (totalSteps === 2 && currentStep === 1 && walletActionsStateResult === null)
  );
};

export const selectIsProgressBar60 = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;
  const stepperItems = selectStepperItems(state);
  const currentStep = selectStepperCurrentStep(state);
  const currentStepData = selectStepperCurrentStepData(state);
  const totalSteps = stepperItems.length;
  const isBridgeStep = currentStepData?.step === 'bridge';

  return (
    isBridgeStep &&
    totalSteps === 2 &&
    currentStep === 1 &&
    walletActionsStateResult === 'success_pending'
  );
};

export const selectIsProgressBar70 = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;
  const stepperItems = selectStepperItems(state);
  const currentStep = selectStepperCurrentStep(state);
  const currentStepData = selectStepperCurrentStepData(state);
  const totalSteps = stepperItems.length;
  const isBridgeStep = currentStepData?.step === 'bridge';

  return (
    isBridgeStep && totalSteps === 2 && currentStep === 1 && walletActionsStateResult === 'success'
  );
};

export const selectIsProgressBar80 = (state: BeefyState) => {
  const bridgeStatus = selectBridgeStatus(state);
  const stepperItems = selectStepperItems(state);
  const currentStep = selectStepperCurrentStep(state);
  const totalSteps = stepperItems.length;

  return bridgeStatus === 'loading' && totalSteps === 2 && currentStep === 1;
};

export const selectIsProgressBar90 = (state: BeefyState) => {
  const bridgeStatus = selectBridgeStatus(state);
  const stepperItems = selectStepperItems(state);
  const currentStep = selectStepperCurrentStep(state);
  const totalSteps = stepperItems.length;

  return bridgeStatus === 'confirming' && totalSteps === 2 && currentStep === 1;
};

export const selectIsProgressBar75 = (state: BeefyState) => {
  const bridgeStatus = selectBridgeStatus(state);
  const walletActionsStateResult = state.user.walletActions.result;
  const stepperItems = selectStepperItems(state);
  const currentStep = selectStepperCurrentStep(state);
  const totalSteps = stepperItems.length;
  return (
    (totalSteps === 1 && bridgeStatus === 'confirming') ||
    (totalSteps === 2 && currentStep === 1 && walletActionsStateResult === 'success_pending')
  );
};

export const selectSuccessBar = (state: BeefyState) => {
  const bridgeStatus = selectBridgeStatus(state);
  const stepperFinished = selectStepperFinished(state);
  const currentStepData = selectStepperCurrentStepData(state);
  return bridgeStatus === 'success' || (stepperFinished && currentStepData?.step !== 'bridge');
};

export const selectErrorBar = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;

  return walletActionsStateResult === 'error';
};
