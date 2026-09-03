import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { arrayOrStaticEmpty, EMPTY_ARRAY } from '../utils/selector-utils.ts';
import { type Abi, getAddress, parseEventLogs, type TransactionReceipt } from 'viem';
import { ZERO_ADDRESS } from '../../../helpers/addresses.ts';
import { BIG_ZERO, fromWei } from '../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../helpers/format.ts';
import {
  isWalletActionBridgeSuccess,
  isWalletActionSuccess,
} from '../actions/wallet/wallet-action.ts';
import type { TokenAmount } from '../apis/transact/transact-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isTokenErc20, isTokenNative } from '../entities/token.ts';
import type { DstTokenReturned } from '../reducers/wallet/stepper-types.ts';
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
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectTokenByAddressOrUndefined,
} from './tokens.ts';
import { isStandardVault, isErc4626Vault } from '../entities/vault.ts';
import { selectTokenByAddress } from './tokens.ts';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults.ts';
import { mooAmountToOracleAmount } from '../utils/ppfs.ts';

const NO_TOKEN_AMOUNTS = EMPTY_ARRAY;

type ReceiptLogs = TransactionReceipt['logs'];

/** The wallet-action reducer never mutates in place, so logs identity implies logs content. */
function memoizeOnLogs<R extends object>(
  parse: (logs: ReceiptLogs) => R
): (logs: ReceiptLogs) => R {
  const cache = new WeakMap<ReceiptLogs, R>();
  return logs => {
    const cached = cache.get(logs);
    if (cached !== undefined) {
      return cached;
    }
    const result = parse(logs);
    cache.set(logs, result);
    return result;
  };
}

export const selectStepperState = (state: BeefyState) => {
  return state.ui.stepperState;
};

export const selectStepperChainId = (state: BeefyState) => {
  return state.ui.stepperState.chainId;
};

export const selectIsStepperStepping = (state: BeefyState) => {
  return (
    state.ui.stepperState.modal &&
    state.ui.stepperState.stepContent !== StepContent.SuccessTx &&
    state.ui.stepperState.stepContent !== StepContent.RecoveryTx
  );
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

export const selectStepperBridgeStatus = (state: BeefyState) => {
  return state.ui.stepperState.bridgeStatus;
};

export const selectIsStepperRecoveryExecution = (state: BeefyState) => {
  return state.ui.stepperState.isRecoveryExecution === true;
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

const parseTransferEvents = memoizeOnLogs(logs =>
  parseEventLogs({ abi: transferAbi, logs, eventName: 'Transfer' })
);

export const selectMintResult = createSelector(
  (state: BeefyState) => state.user.walletActions,
  walletActions => {
    if (!isWalletActionSuccess(walletActions)) {
      throw new Error('Not wallet action success');
    }

    if (!isBaseAdditionalData(walletActions.additional)) {
      throw new Error('Missing wallet additional data');
    }

    const { receipt } = walletActions.data;
    const { token: mintToken, amount } = walletActions.additional;

    const result = {
      type: 'mint',
      amount: formatTokenDisplayCondensed(amount, mintToken.decimals),
      token: mintToken,
    };

    const transferEvents = parseTransferEvents(receipt.logs);

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
);

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

export function selectBoostClaimed(state: BeefyState): TokenAmount[] {
  if (!isWalletActionSuccess(state.user.walletActions)) {
    return NO_TOKEN_AMOUNTS;
  }
  if (!isBoostAdditionalData(state.user.walletActions.additional)) {
    return NO_TOKEN_AMOUNTS;
  }

  const { receipt } = state.user.walletActions.data;
  const { boostId, token, walletAddress } = state.user.walletActions.additional;

  if (!boostId || !receipt || !receipt.logs) {
    return NO_TOKEN_AMOUNTS;
  }

  const boost = selectBoostById(state, boostId);

  // Tokens sent from boost to the user, excluding the vault token
  const from = getAddress(boost.contractAddress);
  const to = getAddress(walletAddress);
  const contract = getAddress(token.address);

  const transferEvents = parseTransferEvents(receipt.logs);

  return arrayOrStaticEmpty(
    transferEvents
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
      .filter(isDefined)
  );
}

export const selectStepperProgress = (state: BeefyState) => {
  if (
    state.ui.stepperState.stepContent === StepContent.BridgingTx ||
    state.ui.stepperState.stepContent === StepContent.RecoveryTx
  ) {
    const completedSteps = state.ui.stepperState.items.length;
    return (completedSteps / (completedSteps + 1)) * 100;
  }

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
  // Gate on stepper's own ErrorTx state so a stale walletActions error from a
  // previous stepper doesn't paint the next stepper's bar red on open.
  return (
    state.ui.stepperState.stepContent === StepContent.ErrorTx &&
    state.user.walletActions.result === 'error'
  );
};

export const selectSuccessBar = (state: BeefyState) => {
  const stepContent = state.ui.stepperState.stepContent;

  return stepContent === StepContent.SuccessTx;
};

export const selectRecoveryBar = (state: BeefyState) => {
  return state.ui.stepperState.stepContent === StepContent.RecoveryTx;
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

const parseTokenReturnedEvents = memoizeOnLogs(logs =>
  parseEventLogs({ abi: tokenReturnedAbi, logs, eventName: 'TokenReturned' })
);

export function selectZapReturned(state: BeefyState): TokenAmount[] {
  if (!isWalletActionSuccess(state.user.walletActions)) {
    return NO_TOKEN_AMOUNTS;
  }
  if (!isZapAdditionalData(state.user.walletActions.additional)) {
    return NO_TOKEN_AMOUNTS;
  }

  const { receipt } = state.user.walletActions.data;
  const { vaultId, expectedTokens } = state.user.walletActions.additional;

  const tokenReturnedEvents = parseTokenReturnedEvents(receipt.logs);

  if (!vaultId || !receipt || !tokenReturnedEvents || !receipt.contractAddress) {
    return NO_TOKEN_AMOUNTS;
  }

  // We need to know what normal tokens to expect, so we don't show them as dust
  if (!expectedTokens || !expectedTokens.length) {
    return NO_TOKEN_AMOUNTS;
  }
  const expectedTokensAddresses: Set<string> = new Set(
    expectedTokens.map(t => t.address.toLowerCase())
  );

  const vault = selectVaultById(state, vaultId);
  const zapAddress = receipt.contractAddress.toLowerCase();
  const returnEvents = tokenReturnedEvents.filter(e => e.address.toLowerCase() === zapAddress);

  if (!returnEvents.length) {
    return NO_TOKEN_AMOUNTS;
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

  return arrayOrStaticEmpty(tokenAmounts);
}

function resolveDstTokensReturned(
  state: BeefyState,
  events: DstTokenReturned[],
  chainId: ChainEntity['id']
): TokenAmount[] {
  const native = selectChainNativeToken(state, chainId);
  return events
    .map(e => {
      const token =
        e.tokenAddress === ZERO_ADDRESS ?
          native
        : selectTokenByAddressOrUndefined(state, chainId, e.tokenAddress);
      return {
        amount: token ? fromWei(e.amount, token.decimals) : BIG_ZERO,
        token,
      };
    })
    .filter((t): t is TokenAmount => !!t.token);
}

function getReceivedAddresses(
  state: BeefyState,
  op: {
    direction: string;
    vaultId: string;
    destChainId: ChainEntity['id'];
    expectedOutput: TokenAmount;
  }
): Set<string> {
  if (op.direction === 'deposit') {
    const vault = selectVaultById(state, op.vaultId);
    return new Set([vault.contractAddress.toLowerCase(), vault.depositTokenAddress.toLowerCase()]);
  }
  if (isTokenNative(op.expectedOutput.token)) {
    const wnative = selectChainWrappedNativeToken(state, op.destChainId);
    return new Set([
      ZERO_ADDRESS.toLowerCase(),
      op.expectedOutput.token.address.toLowerCase(),
      wnative.address.toLowerCase(),
    ]);
  }
  return new Set([op.expectedOutput.token.address.toLowerCase()]);
}

export function selectCrossChainDstReceived(state: BeefyState): TokenAmount[] {
  const bridgeStatus = selectStepperBridgeStatus(state);
  if (!bridgeStatus?.dstTokensReturned?.length || !bridgeStatus.opId) {
    return NO_TOKEN_AMOUNTS;
  }

  const op = state.ui.transact.crossChain.pendingOps[bridgeStatus.opId];
  if (!op) {
    return NO_TOKEN_AMOUNTS;
  }

  const destChainId = bridgeStatus.destChainId;
  const receivedAddresses = getReceivedAddresses(state, { ...op, destChainId });

  const receivedEvents = bridgeStatus.dstTokensReturned.filter(e =>
    receivedAddresses.has(e.tokenAddress.toLowerCase())
  );

  const tokenAmounts = resolveDstTokensReturned(state, receivedEvents, destChainId);

  if (op.direction === 'deposit') {
    const vault = selectVaultById(state, op.vaultId);
    if (isStandardVault(vault) || isErc4626Vault(vault)) {
      const ppfs = selectVaultPricePerFullShare(state, vault.id);
      const vaultDepositToken = selectTokenByAddress(
        state,
        vault.chainId,
        vault.depositTokenAddress
      );
      return arrayOrStaticEmpty(
        tokenAmounts.map(item => ({
          amount: mooAmountToOracleAmount(item.token, vaultDepositToken, ppfs, item.amount),
          token: vaultDepositToken,
        }))
      );
    }
  }

  return arrayOrStaticEmpty(tokenAmounts);
}

export function selectCrossChainDstDust(state: BeefyState): TokenAmount[] {
  const bridgeStatus = selectStepperBridgeStatus(state);
  if (!bridgeStatus?.dstTokensReturned?.length || !bridgeStatus.opId) {
    return NO_TOKEN_AMOUNTS;
  }

  const op = state.ui.transact.crossChain.pendingOps[bridgeStatus.opId];
  if (!op) {
    return NO_TOKEN_AMOUNTS;
  }

  const destChainId = bridgeStatus.destChainId;
  const receivedAddresses = getReceivedAddresses(state, { ...op, destChainId });

  const dustEvents = bridgeStatus.dstTokensReturned.filter(
    e => !receivedAddresses.has(e.tokenAddress.toLowerCase())
  );

  return arrayOrStaticEmpty(resolveDstTokensReturned(state, dustEvents, destChainId));
}

export function selectCrossChainSrcReturned(state: BeefyState): TokenAmount[] {
  const bridgeStatus = selectStepperBridgeStatus(state);
  if (!bridgeStatus?.srcTokensReturned?.length) {
    return NO_TOKEN_AMOUNTS;
  }

  const srcChainId = bridgeStatus.srcChainId;
  return arrayOrStaticEmpty(
    resolveDstTokensReturned(state, bridgeStatus.srcTokensReturned, srcChainId)
  );
}
