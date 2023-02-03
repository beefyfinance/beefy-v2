import { BigNumber } from 'bignumber.js';
import { BeefyState } from '../../../redux-types';
import { formatBigDecimals } from '../../../helpers/format';
import { isTokenErc20 } from '../entities/token';
import { StepContent } from '../reducers/wallet/stepper';
import { TokenAmount } from '../apis/transact/transact-types';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectTokenByAddress,
} from './tokens';
import { fromWeiString } from '../../../helpers/big-number';
import { selectVaultById } from './vaults';
import { wnativeToNative } from '../apis/transact/helpers/tokens';
import { ZERO_ADDRESS } from '../../../helpers/addresses';

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

export function selectMintResult(state: BeefyState) {
  const { receipt, token: mintToken, amount } = state.user.walletActions.data;
  const result = {
    type: 'mint',
    amount: formatBigDecimals(amount, 4),
    token: mintToken,
  };

  if (!mintToken || !isTokenErc20(mintToken) || !receipt || !('Transfer' in receipt.events)) {
    return result;
  }

  const userAddress = receipt.from.toLowerCase();
  const mintContractAddress = receipt.to.toLowerCase();
  const mintTokenAddress = mintToken.address.toLowerCase();
  const transferEvents = Array.isArray(receipt.events['Transfer'])
    ? receipt.events['Transfer']
    : [receipt.events['Transfer']];
  const mintTransferEvent = transferEvents.find(
    e =>
      e.address.toLowerCase() === mintTokenAddress &&
      e.returnValues.to.toLowerCase() === mintContractAddress &&
      e.returnValues.from.toLowerCase() === ZERO_ADDRESS
  );
  const userTransferEvent = transferEvents.find(
    e =>
      e.address.toLowerCase() === mintTokenAddress &&
      e.returnValues.to.toLowerCase() === userAddress &&
      e.returnValues.from.toLowerCase() === mintContractAddress
  );

  if (!mintTransferEvent && userTransferEvent) {
    result.type = 'buy';
    result.amount = formatBigDecimals(
      new BigNumber(userTransferEvent.returnValues.value).shiftedBy(-mintToken.decimals),
      4
    );
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

export function selectZapReturned(state: BeefyState) {
  const { receipt, vaultId } = state.user.walletActions.data;

  if (!vaultId || !receipt || !('TokenReturned' in receipt.events)) {
    return [];
  }

  const vault = selectVaultById(state, vaultId);
  const zapAddress = receipt.to.toLowerCase();
  const returnEvents = (
    Array.isArray(receipt.events['TokenReturned'])
      ? receipt.events['TokenReturned']
      : [receipt.events['TokenReturned']]
  ).filter(e => e.address.toLowerCase() === zapAddress);

  if (!returnEvents.length) {
    return [];
  }

  const minAmount = new BigNumber('0.00000001');
  const wnative = selectChainWrappedNativeToken(state, vault.chainId);
  const native = selectChainNativeToken(state, vault.chainId);
  const tokenAmounts: TokenAmount[] = returnEvents
    .map(e => {
      const token = selectTokenByAddress(state, vault.chainId, e.returnValues.token);
      return {
        amount: fromWeiString(e.returnValues.amount, token.decimals),
        token: wnativeToNative(token, wnative, native),
      };
    })
    .filter(t => t.amount.gte(minAmount));

  return tokenAmounts;
}
