import { BigNumber } from 'bignumber.js';
import { BeefyState } from '../../../redux-types';
import { formatBigDecimals } from '../../../helpers/format';
import { isTokenErc20 } from '../entities/token';
import { WalletActionsState } from '../reducers/wallet/wallet-action';
import { StepContent } from '../reducers/wallet/stepper';

export const selectStepperState = (state: BeefyState) => {
  return state.ui.stepperState;
};

export const selectStepperChainId = (state: BeefyState) => {
  return state.ui.stepperState.chainId;
};

export const selectIsStepperStepping = (state: BeefyState) => {
  return state.ui.stepperState.modal && state.ui.stepperState.stepContent !== StepContent.SuccessTx;
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

export const selectStepperStepContent = (state: BeefyState) => {
  return state.ui.stepperState.stepContent;
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

export const selectStepperProgress = (state: BeefyState) => {
  const currentStep = state.ui.stepperState.currentStep;
  const step = state.ui.stepperState.items[currentStep]?.step;
  const percentagePerStep = 100 / state.ui.stepperState.items.length;
  const currentTxProgress =
    step === 'bridge' ? selectBridgeTxProgress(state) : selectStandardTxPercentage(state);

  return currentStep * percentagePerStep + percentagePerStep * currentTxProgress;
};

/*
Each Standar Tx have 3 possible scenarios
1- need user interaction
2- tx mining
3- tx mined
*/
const selectStandardTxPercentage = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;
  if (walletActionsStateResult === null) {
    return 0;
  } else if (walletActionsStateResult === 'success_pending') {
    return 0.5;
  }
};

/*
Each Bridge Tx have 5 possible scenarios
1- need user interaction
2- tx mining
3- tx mined - dest tx need to start
4- bridge tx mining
5- bridge tx mined
*/
export const selectBridgeTxProgress = (state: BeefyState) => {
  const bridgeStatus = state.ui.bridge.status;
  const walletActionsStateResult = state.user.walletActions.result;

  if (walletActionsStateResult === null) {
    return 0;
  } else if (walletActionsStateResult === 'success_pending') {
    return 0.25;
  } else if (bridgeStatus === 'loading') {
    return 0.5;
  } else if (bridgeStatus === 'confirming') {
    return 0.75;
  }
};

export const selectErrorBar = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;

  return walletActionsStateResult === 'error';
};

export const selectSuccessBar = (state: BeefyState) => {
  const stepContent = state.ui.stepperState.stepContent;
  const bridgeStatus = state.ui.bridge.status;

  return stepContent === StepContent.SuccessTx || bridgeStatus === 'success';
};
