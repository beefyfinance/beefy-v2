import { CCTP_CONFIG } from '../../../config/cctp/cctp-config.ts';
import type { MessageLifecycleState, MessageListResponse } from '../apis/cctp/cctp-api-types.ts';
import { getCCTPApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { StepContent } from '../reducers/wallet/stepper-types.ts';
import { selectChainById } from '../selectors/chains.ts';
import type { BeefyThunk } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { transactClearInput } from './transact.ts';
import { stepperSetBridgeStatus, stepperSetStepContent } from './wallet/stepper.ts';

const POLL_INTERVAL_MS = 2000;

const TERMINAL_STATES: ReadonlySet<MessageLifecycleState> = new Set([
  'confirmed',
  'cancelled',
  'abandoned',
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
  return async dispatch => {
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

        console.debug('[CCTP] Bridge status:', message.lifecycleState);
        dispatch(stepperSetBridgeStatus({ lifecycleState: message.lifecycleState }));

        if (message.lifecycleState === 'confirmed') {
          console.debug('[CCTP] Bridge confirmed, dstTxHash:', message.dstTxHash);
          dispatch(stepperSetBridgeStatus({ dstTxHash: message.dstTxHash }));
          dispatch(stepperSetStepContent({ stepContent: StepContent.SuccessTx }));
          dispatch(transactClearInput());
          return;
        }

        if (message.lifecycleState === 'cancelled' || message.lifecycleState === 'abandoned') {
          console.debug('[CCTP] Bridge failed:', message.lifecycleState);
          dispatch(stepperSetStepContent({ stepContent: StepContent.ErrorTx }));
          return;
        }

        if (!TERMINAL_STATES.has(message.lifecycleState)) {
          schedulePoll();
        }
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
