import { BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../redux-types';
import { formatBigDecimals } from '../../../helpers/format';
import { isTokenErc20, isTokenNative } from '../entities/token';
import { StepContent } from '../reducers/wallet/stepper';
import type { TokenAmount } from '../apis/transact/transact-types';
import { selectChainNativeToken, selectTokenByAddressOrNull } from './tokens';
import { fromWeiString } from '../../../helpers/big-number';
import { selectVaultById } from './vaults';
import { ZERO_ADDRESS } from '../../../helpers/addresses';
import {
  type BridgeAdditionalData,
  isWalletActionBridgeSuccess,
  isWalletActionSuccess,
  isZapAdditionalData,
  type WalletActionsSuccessState,
} from '../reducers/wallet/wallet-action';

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
  if (!isWalletActionSuccess(state.user.walletActions)) {
    throw new Error('Not wallet action success');
  }

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

export function selectBridgeSuccess(
  state: BeefyState
): WalletActionsSuccessState<BridgeAdditionalData> {
  if (isWalletActionBridgeSuccess(state.user.walletActions)) {
    return state.user.walletActions;
  }

  throw new Error('Not bridge success');
}

export const selectStepperProgress = (state: BeefyState) => {
  const currentStep = state.ui.stepperState.currentStep;
  const percentagePerStep = 100 / state.ui.stepperState.items.length;
  const currentTxProgress = selectStandardTxPercentage(state);

  return currentStep * percentagePerStep + percentagePerStep * currentTxProgress;
};

/**
 * Each Standard Tx have 3 possible scenarios
 * 1 - need user interaction
 * 2 - tx mining
 * 3 - tx mined
 */
const selectStandardTxPercentage = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;
  if (walletActionsStateResult === null) {
    return 0;
  } else if (walletActionsStateResult === 'success_pending') {
    return 0.5;
  }
};

export const selectErrorBar = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;

  return walletActionsStateResult === 'error';
};

export const selectSuccessBar = (state: BeefyState) => {
  const stepContent = state.ui.stepperState.stepContent;

  return stepContent === StepContent.SuccessTx;
};

export function selectZapReturned(state: BeefyState) {
  console.log(state.user.walletActions);
  if (!isWalletActionSuccess(state.user.walletActions)) {
    return [];
  }
  if (!isZapAdditionalData(state.user.walletActions.data)) {
    return [];
  }

  const { receipt, vaultId, expectedTokens } = state.user.walletActions.data;

  if (!vaultId || !receipt || !('TokenReturned' in receipt.events)) {
    return [];
  }

  if (!expectedTokens || !expectedTokens.length) {
    return [];
  }

  // We need to know what normal tokens to expect, so we don't show them as dust
  const excludeTokens: string[] = expectedTokens.map(t =>
    isTokenNative(t) ? ZERO_ADDRESS : t.address.toLowerCase()
  );

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
  const native = selectChainNativeToken(state, vault.chainId);
  const tokenAmounts: TokenAmount[] = returnEvents
    .map(e => {
      const token =
        e.returnValues.token === ZERO_ADDRESS
          ? native
          : selectTokenByAddressOrNull(state, vault.chainId, e.returnValues.token);

      return {
        amount: fromWeiString(e.returnValues.amount, token.decimals),
        token,
      };
    })
    .filter(t => !excludeTokens.includes(t.token.address.toLowerCase()))
    .filter(t => t.amount.gte(minAmount));

  return tokenAmounts;
}
