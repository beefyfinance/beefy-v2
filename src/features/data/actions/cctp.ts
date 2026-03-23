import BigNumber from 'bignumber.js';
import { type Abi, parseEventLogs } from 'viem';
import { CCTP_CONFIG } from '../../../config/cctp/cctp-config.ts';
import type { MessageLifecycleState, MessageListResponse } from '../apis/cctp/cctp-api-types.ts';
import { getCCTPApi } from '../apis/instances.ts';
import { rpcClientManager } from '../apis/rpc-contract/rpc-manager.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { DstTokenReturned } from '../reducers/wallet/stepper-types.ts';
import { StepContent } from '../reducers/wallet/stepper-types.ts';
import { selectChainById } from '../selectors/chains.ts';
import { selectStepperBridgeStatus } from '../selectors/stepper.ts';
import { selectTokenByAddress } from '../selectors/tokens.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import type { BeefyState, BeefyThunk } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { fetchBalanceAction } from './balance.ts';
import { crossChainFetchRecoveryQuote, crossChainOpStatusUpdate } from './wallet/cross-chain.ts';
import { stepperSetBridgeStatus, stepperSetStepContent } from './wallet/stepper.ts';

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
          schedulePoll();
          return;
        }

        dispatch(stepperSetBridgeStatus({ lifecycleState: message.lifecycleState }));

        if (message.dstTxHash && message.dstZapSuccess === false) {
          dispatch(handleDestinationRecovery(message.dstRefundedAmount, getState));
          return;
        }

        if (message.lifecycleState === 'confirmed' && message.dstTxHash) {
          dispatch(stepperSetBridgeStatus({ dstTxHash: message.dstTxHash }));
          dispatch(fetchVaultChainBalances(getState));

          const bridgeStatusForDst = selectStepperBridgeStatus(getState());
          if (bridgeStatusForDst?.destChainId) {
            dispatch(
              fetchCCTPDstTokensReturned({
                destChainId: bridgeStatusForDst.destChainId,
                dstTxHash: message.dstTxHash,
              })
            );
          }

          if (bridgeStatusForDst?.srcChainId) {
            dispatch(
              fetchCrossChainSrcTokensReturned({
                srcChainId: bridgeStatusForDst.srcChainId,
                srcTxHash: txHash,
              })
            );
          }

          // When hookData exceeded the CCTP message size limit, the source tx bridged
          // USDC directly to the user's wallet instead of through the receiver contract.
          // Now that the bridge is confirmed, route to recovery so the user can execute
          // the destination deposit/swap as a separate transaction.
          const bridgeStatus = selectStepperBridgeStatus(getState());
          const op =
            bridgeStatus?.opId ?
              getState().ui.transact.crossChain.pendingOps[bridgeStatus.opId]
            : undefined;
          if (op?.twoStep) {
            dispatch(handleDestinationRecovery(message.dstAmountIn, getState));
          } else {
            dispatch(stepperSetStepContent({ stepContent: StepContent.SuccessTx }));
          }
          return;
        }

        if (TERMINAL_STATES.has(message.lifecycleState)) {
          dispatch(handleDestinationRecovery(message.dstRefundedAmount, getState));
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

function handleDestinationRecovery(
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
  };
}

const tokenReturnedAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'TokenReturned',
    type: 'event',
  },
] as const satisfies Abi;

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

export const fetchCCTPDstTokensReturned = createAppAsyncThunk<
  DstTokenReturned[],
  { destChainId: ChainEntity['id']; dstTxHash: string }
>('cctp/fetchCCTPDstTokensReturned', async ({ destChainId, dstTxHash }, { getState }) => {
  const publicClient = rpcClientManager.getSingleClient(destChainId);
  const receipt = await publicClient.getTransactionReceipt({
    hash: dstTxHash as `0x${string}`,
  });

  const tokenReturnedEvents = parseEventLogs({
    abi: tokenReturnedAbi,
    logs: receipt.logs,
    eventName: 'TokenReturned',
  });

  const results: DstTokenReturned[] = [];
  for (const e of tokenReturnedEvents) {
    results.push({
      tokenAddress: e.args.token,
      amount: e.args.amount.toString(10),
    });
  }

  const state: BeefyState = getState();
  const bridgeStatus = selectStepperBridgeStatus(state);
  const op =
    bridgeStatus?.opId ? state.ui.transact.crossChain.pendingOps[bridgeStatus.opId] : undefined;

  if (op) {
    const vault = selectVaultById(state, op.vaultId);
    const receiptAddress =
      op.direction === 'deposit' ?
        vault.contractAddress.toLowerCase()
      : op.expectedOutput.token.address.toLowerCase();

    const alreadyCaptured = results.some(r => r.tokenAddress.toLowerCase() === receiptAddress);

    if (!alreadyCaptured) {
      const userAddress = selectWalletAddress(state)?.toLowerCase();
      if (userAddress) {
        const transferEvents = parseEventLogs({
          abi: transferAbi,
          logs: receipt.logs,
          eventName: 'Transfer',
        });

        for (const evt of transferEvents) {
          if (
            evt.address.toLowerCase() === receiptAddress &&
            evt.args.to.toLowerCase() === userAddress
          ) {
            results.push({
              tokenAddress: evt.address,
              amount: evt.args.value.toString(10),
            });
          }
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return results;
});

export const fetchCrossChainSrcTokensReturned = createAppAsyncThunk<
  DstTokenReturned[],
  { srcChainId: ChainEntity['id']; srcTxHash: string }
>('cctp/fetchCrossChainSrcTokensReturned', async ({ srcChainId, srcTxHash }) => {
  const publicClient = rpcClientManager.getSingleClient(srcChainId);
  const receipt = await publicClient.getTransactionReceipt({
    hash: srcTxHash as `0x${string}`,
  });

  const tokenReturnedEvents = parseEventLogs({
    abi: tokenReturnedAbi,
    logs: receipt.logs,
    eventName: 'TokenReturned',
  });

  const results: DstTokenReturned[] = [];
  for (const e of tokenReturnedEvents) {
    if (e.args.amount > 0n) {
      results.push({
        tokenAddress: e.args.token,
        amount: e.args.amount.toString(10),
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return results;
});

function fetchVaultChainBalances(getState: () => BeefyState): BeefyThunk {
  return dispatch => {
    const state = getState();
    const bridgeStatus = selectStepperBridgeStatus(state);
    if (!bridgeStatus) return;

    const { destChainId, vaultId } = bridgeStatus;
    if (!vaultId) return;

    const vault = selectVaultById(state, vaultId);

    const vaultChainTokens: TokenEntity[] = [];
    const vaultChainCctp = CCTP_CONFIG.chains[vault.chainId];
    if (vaultChainCctp) {
      vaultChainTokens.push(selectTokenByAddress(state, vault.chainId, vaultChainCctp.usdcAddress));
    }
    dispatch(
      fetchBalanceAction({ chainId: vault.chainId, tokens: vaultChainTokens, vaults: [vault] })
    );

    if (destChainId !== vault.chainId) {
      const destTokens: TokenEntity[] = [];
      const destCctp = CCTP_CONFIG.chains[destChainId];
      if (destCctp) {
        destTokens.push(selectTokenByAddress(state, destChainId, destCctp.usdcAddress));
      }
      dispatch(fetchBalanceAction({ chainId: destChainId, tokens: destTokens }));
    }
  };
}
