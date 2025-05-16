import BigNumber from 'bignumber.js';
import { type Abi, getAddress, parseEventLogs } from 'viem';
import { ZERO_ADDRESS } from '../../../helpers/addresses.ts';
import { BIG_ZERO, fromWei } from '../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../helpers/format.ts';
import {
  isWalletActionBridgeSuccess,
  isWalletActionSuccess,
} from '../actions/wallet/wallet-action.ts';
import type { TokenAmount } from '../apis/transact/transact-types.ts';
import { isTokenErc20 } from '../entities/token.ts';
import { type Step, StepContent } from '../reducers/wallet/stepper-types.ts';
import {
  type BridgeAdditionalData,
  isBaseAdditionalData,
  isBoostAdditionalData,
  isZapAdditionalData,
  type WalletActionsSuccessState,
} from '../reducers/wallet/wallet-action-types.ts';
import type { BeefyState } from '../store/types.ts';
import { isDefined } from '../utils/array-utils.ts';
import { selectBoostById } from './boosts.ts';
import { selectChainNativeToken, selectTokenByAddressOrUndefined } from './tokens.ts';
import { selectVaultById } from './vaults.ts';

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

export const selectStepperCurrentStepData = (state: BeefyState): Step => {
  const currentStep = state.ui.stepperState.currentStep;
  return state.ui.stepperState.items[currentStep];
};

export const selectStepperItems = (state: BeefyState) => {
  return state.ui.stepperState.items;
};

export const selectStepperStepContent = (state: BeefyState) => {
  return state.ui.stepperState.stepContent;
};

const transferAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const satisfies Abi;

export function selectMintResult(state: BeefyState) {
  if (!isWalletActionSuccess(state.user.walletActions)) {
    throw new Error('Not wallet action success');
  }

  if (!isBaseAdditionalData(state.user.walletActions.additional)) {
    throw new Error('Missing wallet additional data');
  }

  const { receipt } = state.user.walletActions.data;
  const { token: mintToken, amount } = state.user.walletActions.additional;

  const result = {
    type: 'mint',
    amount: formatTokenDisplayCondensed(amount, mintToken.decimals),
    token: mintToken,
  };

  const transferEvents = parseEventLogs({
    abi: transferAbi,
    logs: receipt.logs,
    eventName: 'Transfer',
  });

  if (
    !mintToken ||
    !isTokenErc20(mintToken) ||
    !receipt ||
    !transferEvents ||
    transferEvents.length === 0
  ) {
    return result;
  }

  const userAddress = receipt.from.toLowerCase();
  const mintContractAddress = receipt.to!.toLowerCase();
  const mintTokenAddress = mintToken.address.toLowerCase();
  const mintTransferEvent = transferEvents.find(
    e =>
      e.address.toLowerCase() === mintTokenAddress &&
      e.args.to.toLowerCase() === mintContractAddress &&
      e.args.from.toLowerCase() === ZERO_ADDRESS
  );
  const userTransferEvent = transferEvents.find(
    e =>
      e.address.toLowerCase() === mintTokenAddress &&
      e.args.to.toLowerCase() === userAddress &&
      e.args.from.toLowerCase() === mintContractAddress
  );

  if (!mintTransferEvent && userTransferEvent) {
    result.type = 'buy';
    result.amount = formatTokenDisplayCondensed(
      fromWei(new BigNumber(userTransferEvent.args.value.toString(10)), mintToken.decimals),
      mintToken.decimals
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

export function selectBoostAdditionalData(state: BeefyState) {
  if (isBoostAdditionalData(state.user.walletActions.additional)) {
    return state.user.walletActions.additional;
  }
  return undefined;
}

export function selectBoostClaimed(state: BeefyState) {
  if (!isWalletActionSuccess(state.user.walletActions)) {
    return [];
  }
  if (!isBoostAdditionalData(state.user.walletActions.additional)) {
    return [];
  }

  const { receipt } = state.user.walletActions.data;
  const { boostId, token, walletAddress } = state.user.walletActions.additional;

  if (!boostId || !receipt || !receipt.logs) {
    return [];
  }

  const boost = selectBoostById(state, boostId);

  // Tokens sent from boost to the user, excluding the vault token
  const from = getAddress(boost.contractAddress);
  const to = getAddress(walletAddress);
  const contract = getAddress(token.address);

  const transferEvents = parseEventLogs({
    abi: transferAbi,
    logs: receipt.logs,
    eventName: 'Transfer',
  });

  return transferEvents
    .filter(e => e.address === contract && e.args.from === from && e.args.to === to)
    .map(e => {
      const token = selectTokenByAddressOrUndefined(state, boost.chainId, e.address);
      if (!token) {
        return undefined;
      }
      const amount = fromWei(e.args.value.toString(), token.decimals);
      if (amount.lte(BIG_ZERO)) {
        return undefined;
      }
      return {
        token,
        amount,
      };
    })
    .filter(isDefined);
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

  return 0;
};

export const selectErrorBar = (state: BeefyState) => {
  const walletActionsStateResult = state.user.walletActions.result;

  return walletActionsStateResult === 'error';
};

export const selectSuccessBar = (state: BeefyState) => {
  const stepContent = state.ui.stepperState.stepContent;

  return stepContent === StepContent.SuccessTx;
};

const tokenReturnedAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TokenReturned',
    type: 'event',
  },
] as const satisfies Abi;

export function selectZapReturned(state: BeefyState) {
  if (!isWalletActionSuccess(state.user.walletActions)) {
    return [];
  }
  if (!isZapAdditionalData(state.user.walletActions.additional)) {
    return [];
  }

  const { receipt } = state.user.walletActions.data;
  const { vaultId, expectedTokens } = state.user.walletActions.additional;

  const tokenReturnedEvents = parseEventLogs({
    abi: tokenReturnedAbi,
    logs: receipt.logs,
    eventName: 'TokenReturned',
  });

  if (!vaultId || !receipt || !tokenReturnedEvents || !receipt.contractAddress) {
    return [];
  }

  // We need to know what normal tokens to expect, so we don't show them as dust
  if (!expectedTokens || !expectedTokens.length) {
    return [];
  }
  const expectedTokensAddresses: Set<string> = new Set(
    expectedTokens.map(t => t.address.toLowerCase())
  );

  const vault = selectVaultById(state, vaultId);
  const zapAddress = receipt.contractAddress.toLowerCase();
  const returnEvents = tokenReturnedEvents.filter(e => e.address.toLowerCase() === zapAddress);

  if (!returnEvents.length) {
    return [];
  }

  const minAmount = new BigNumber('0.00000001');
  const native = selectChainNativeToken(state, vault.chainId);
  const tokenAmounts: TokenAmount[] = returnEvents
    .map(e => {
      const token =
        e.args.token === ZERO_ADDRESS ?
          native
        : selectTokenByAddressOrUndefined(state, vault.chainId, e.args.token);

      return {
        amount: token ? fromWei(e.args.amount.toString(10), token.decimals) : BIG_ZERO,
        token,
      };
    })
    .filter((t): t is TokenAmount => !!t.token)
    .filter(t => !expectedTokensAddresses.has(t.token.address.toLowerCase()))
    .filter(t => t.amount.gte(minAmount));

  return tokenAmounts;
}
