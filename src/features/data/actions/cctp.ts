import BigNumber from 'bignumber.js';
import { CCTP_CONFIG } from '../../../config/cctp/cctp-config.ts';
import type { MessageLifecycleState, MessageListResponse } from '../apis/cctp/cctp-api-types.ts';
import { getCCTPApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { StepContent } from '../reducers/wallet/stepper-types.ts';
import { selectChainById } from '../selectors/chains.ts';
import { selectStepperBridgeStatus } from '../selectors/stepper.ts';
import { selectTokenByAddress } from '../selectors/tokens.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import type { BeefyState, BeefyThunk } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { fetchBalanceAction } from './balance.ts';
import { transactClearInput } from './transact.ts';
import { crossChainFetchRecoveryQuote, crossChainOpStatusUpdate } from './wallet/cross-chain.ts';
import {
  stepperSetBridgeStatus,
  stepperSetModel,
  stepperSetStepContent,
} from './wallet/stepper.ts';

const POLL_INTERVAL_MS = 2000;

const TERMINAL_STATES: ReadonlySet<MessageLifecycleState> = new Set([
  'confirmed',
  'cancelled',
  'abandoned',
  'zap_failed',
]);

export const fetchCCTPBridgeStatusByTxHash = createAppAsyncThunk<
  MessageListResponse,
  { srcChainId: ChainEntity['id']; txHash: string }
>('cctp/fetchCCTPBridgeStatusByTxHash', async ({ srcChainId, txHash }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, srcChainId);

  if (!chain || !CCTP_CONFIG.chains[srcChainId]) {
    throw new Error(`Chain ${srcChainId} not found`);
  }
  const api = await getCCTPApi();
  return await api.getTxStatusByTxHash(chain.networkChainId, txHash);
});

export function pollCCTPBridgeStatus({
  srcChainId,
  txHash,
}: {
  srcChainId: ChainEntity['id'];
  txHash: string;
}): BeefyThunk {
  return async (dispatch, getState) => {
    const poll = async () => {
      try {
        const result = await dispatch(
          fetchCCTPBridgeStatusByTxHash({ srcChainId, txHash })
        ).unwrap();
        const message = result.messages?.[0];

        if (!message) {
          console.debug('[CCTP] No messages yet, polling again...');
          schedulePoll();
          return;
        }

        console.debug('[CCTP] Bridge status:', message.lifecycleState, {
          dstZapSuccess: message.dstZapSuccess,
          dstTxHash: message.dstTxHash,
        });
        dispatch(stepperSetBridgeStatus({ lifecycleState: message.lifecycleState }));

        if (message.dstTxHash && message.dstZapSuccess === false) {
          console.debug('[CCTP] Zap failed on destination:', message.lifecycleState);
          dispatch(handleBridgeFailure(message.dstRefundedAmount, getState));
          return;
        }

        if (message.lifecycleState === 'confirmed' && message.dstTxHash) {
          console.debug('[CCTP] Bridge confirmed, dstTxHash:', message.dstTxHash);
          dispatch(stepperSetBridgeStatus({ dstTxHash: message.dstTxHash }));
          dispatch(stepperSetStepContent({ stepContent: StepContent.SuccessTx }));
          dispatch(transactClearInput());
          dispatch(fetchVaultChainBalances(getState));
          return;
        }

        if (TERMINAL_STATES.has(message.lifecycleState)) {
          console.debug('[CCTP] Terminal state without dstTxHash:', message.lifecycleState);
          dispatch(stepperSetStepContent({ stepContent: StepContent.ErrorTx }));
          return;
        }

        schedulePoll();
      } catch (err) {
        console.warn('[CCTP] Poll error, retrying...', err);
        schedulePoll();
      }
    };

    const schedulePoll = () => {
      setTimeout(() => dispatch(pollCCTPBridgeStatus({ srcChainId, txHash })), POLL_INTERVAL_MS);
    };

    await poll();
  };
}

function handleBridgeFailure(
  dstRefundedAmount: string | null,
  getState: () => BeefyState
): BeefyThunk {
  return async dispatch => {
    const state = getState();
    const bridgeStatus = selectStepperBridgeStatus(state);
    if (!bridgeStatus) {
      dispatch(stepperSetStepContent({ stepContent: StepContent.ErrorTx }));
      return;
    }

    const { opId } = bridgeStatus;
    if (!opId) {
      console.warn('[CCTP] No opId found in bridge status, falling back to error');
      dispatch(stepperSetStepContent({ stepContent: StepContent.ErrorTx }));
      return;
    }

    dispatch(stepperSetBridgeStatus({ dstRefundedAmount: dstRefundedAmount ?? '0' }));

    const op = state.ui.transact.crossChain.pendingOps[opId];
    if (op) {
      const rawRefund = new BigNumber(dstRefundedAmount ?? '0');
      let humanRefund: string;
      if (rawRefund.gt(0)) {
        const bridgeToken = selectTokenByAddress(
          state,
          op.recovery.destChainId,
          op.recovery.bridgeTokenAddress
        );
        humanRefund = rawRefund.shiftedBy(-bridgeToken.decimals).toString(10);
      } else {
        humanRefund = op.recovery.bridgedAmount;
      }
      dispatch(
        crossChainOpStatusUpdate({
          id: opId,
          status: 'dest-failed',
          recoveryBridgedAmount: humanRefund,
        })
      );
    }

    try {
      await dispatch(crossChainFetchRecoveryQuote({ opId })).unwrap();
    } catch (err) {
      console.warn('[CCTP] Recovery quote fetch failed (will retry from form):', err);
    }

    dispatch(stepperSetStepContent({ stepContent: StepContent.RecoveryTx }));
    dispatch(stepperSetModel({ modal: false }));
  };
}

function fetchVaultChainBalances(getState: () => BeefyState): BeefyThunk {
  return dispatch => {
    const state = getState();
    const bridgeStatus = selectStepperBridgeStatus(state);
    if (!bridgeStatus) return;

    const { destChainId, vaultId } = bridgeStatus;
    const vault = selectVaultById(state, vaultId);
    const cctpConfig = CCTP_CONFIG.chains[destChainId];

    const tokens = [];
    if (cctpConfig) {
      const usdc = selectTokenByAddress(state, destChainId, cctpConfig.usdcAddress);
      tokens.push(usdc);
    }

    dispatch(fetchBalanceAction({ chainId: destChainId, tokens, vaults: [vault] }));
  };
}
