import BigNumber from 'bignumber.js';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Namespace, TFunction } from 'react-i18next';
import type { Hash, PublicClient } from 'viem';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MessageListResponse } from '../apis/cctp/cctp-api-types.ts';
import type { RecoveryQuote } from '../apis/transact/transact-types.ts';
import type { TokenEntity } from '../entities/token.ts';
import { StepContent, type Step } from '../reducers/wallet/stepper-types.ts';
import type { PendingCrossChainOp } from '../reducers/wallet/transact-types.ts';
import type { BeefyDispatchFn } from '../store/types.ts';

const cctp = vi.hoisted(() => ({ getTxStatusByTxHash: vi.fn() }));
const rpc = vi.hoisted(() => ({ getTransactionReceipt: vi.fn() }));
const transactApi = vi.hoisted(() => ({
  fetchRecoveryQuote: vi.fn(),
  fetchRecoveryStep: vi.fn(),
}));

vi.mock('../apis/instances.ts', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getCCTPApi: async () => cctp,
  getTransactApi: async () => transactApi,
}));

vi.mock('../apis/rpc-contract/rpc-manager.ts', async importOriginal => {
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    rpcClientManager: { getSingleClient: () => rpc, getBatchClient: () => rpc },
  };
});

vi.mock('viem/actions', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  waitForTransactionReceipt: vi.fn(async (_client: unknown, { hash }: { hash: Hash }) => ({
    status: 'success',
    logs: [],
    transactionHash: hash,
  })),
}));

import { stepperSlice } from '../reducers/wallet/stepper.ts';
import { transactReducer } from '../reducers/wallet/transact.ts';
import { walletActionsReducer } from '../reducers/wallet/wallet-action.ts';
import { transactSetSuccessClosed } from './transact.ts';
import { bindTransactionEvents, captureWalletErrors, txStart, txWallet } from './wallet/common.ts';
import {
  crossChainFetchRecoveryQuote,
  crossChainOpInitiated,
  crossChainRecoverySteps,
} from './wallet/cross-chain.ts';
import { stepperStartWithSteps, stepperReset, stepperUpdateCurrentStep } from './wallet/stepper.ts';
import { createWalletActionResetAction } from './wallet/wallet-action.ts';

const SRC_A: Hash = `0x${'a'.repeat(64)}`;
const SRC_B: Hash = `0x${'b'.repeat(64)}`;
const DST_A = `0x${'d'.repeat(64)}`;
const DST_B = `0x${'e'.repeat(64)}`;
const DEST_USDC = '0x0000000000000000000000000000000000000001';
const destUsdc = { chainId: 'arbitrum', address: DEST_USDC, decimals: 6 } as TokenEntity;
const POLL_INTERVAL_MS = 2000;
const t = ((key: string) => key) as TFunction<Namespace>;

const chains = {
  byId: {
    base: { id: 'base', networkChainId: 8453 },
    arbitrum: { id: 'arbitrum', networkChainId: 42161 },
  },
};
const tokens = {
  byChainId: {
    arbitrum: { byAddress: { [DEST_USDC]: destUsdc } },
  },
};

const reducer = combineReducers({
  entities: combineReducers({ chains: () => chains, tokens: () => tokens }),
  ui: combineReducers({ stepperState: stepperSlice.reducer, transact: transactReducer }),
  user: combineReducers({ walletActions: walletActionsReducer }),
});

function makeStore() {
  const store = configureStore({
    reducer,
    middleware: getDefault => getDefault({ serializableCheck: false, immutableCheck: false }),
  });
  return { store, dispatch: store.dispatch as unknown as BeefyDispatchFn };
}
type TestStore = ReturnType<typeof makeStore>;

const stepper = ({ store }: TestStore) => store.getState().ui.stepperState;
const opStatus = ({ store }: TestStore, id: string) =>
  store.getState().ui.transact.crossChain.pendingOps[id]?.status;
const walletResult = ({ store }: TestStore) => store.getState().user.walletActions.result;

function makeOp(id: string, sourceTxHash: Hash, twoStep?: boolean): PendingCrossChainOp {
  return {
    id,
    status: 'source-done',
    direction: 'deposit',
    sourceChainId: 'base',
    destChainId: 'arbitrum',
    vaultId: 'test-vault',
    sourceTxHash,
    sourceInput: { token: destUsdc, amount: new BigNumber(1) },
    expectedOutput: { token: destUsdc, amount: new BigNumber(1) },
    sourceDisplaySteps: [],
    destDisplaySteps: [],
    recovery: {
      destHandlerKind: 'passthrough',
      destChainId: 'arbitrum',
      bridgeTokenAddress: DEST_USDC,
      bridgedAmount: '1',
    },
    ...(twoStep ? { twoStep } : {}),
    createdAt: 1,
    updatedAt: 1,
  };
}

const zapData = { type: 'zap', amount: new BigNumber(0), token: {}, expectedTokens: [] } as never;

/** a cross-chain zap whose source tx is signed and mined at once */
function crossChainStep(op: PendingCrossChainOp): Step {
  return {
    step: 'zap-in',
    message: 'zap',
    pending: false,
    extraInfo: { zap: true, crossChain: { sourceChainId: 'base', destChainId: 'arbitrum' } },
    action: captureWalletErrors(async dispatch => {
      txStart(dispatch);
      dispatch(crossChainOpInitiated(op));
      txWallet(dispatch);
      bindTransactionEvents(
        dispatch,
        Promise.resolve(op.sourceTxHash as Hash),
        {} as PublicClient,
        zapData
      );
    }),
  };
}

/** a same-chain zap left waiting for the user to sign */
const sameChainStep: Step = {
  step: 'zap-in',
  message: 'zap',
  pending: false,
  extraInfo: { zap: true },
  action: captureWalletErrors(async dispatch => {
    txStart(dispatch);
    txWallet(dispatch);
    bindTransactionEvents(dispatch, new Promise<Hash>(() => {}), {} as PublicClient, zapData);
  }),
};

const settle = async () => {
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setImmediate(resolve));
  }
};

async function start({ dispatch }: TestStore, step: Step) {
  dispatch(stepperStartWithSteps([step], 'base'));
  await settle();
  dispatch(stepperUpdateCurrentStep({ pending: true }));
  await dispatch(step.action);
  await settle();
}

/** web3 onWalletDisconnected */
function walletDisconnected({ dispatch }: TestStore) {
  dispatch(createWalletActionResetAction());
  dispatch(transactSetSuccessClosed(false));
  dispatch(stepperReset());
}

async function nextPoll() {
  await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
  await settle();
}

function message(lifecycleState: string, rest: Record<string, unknown> = {}): MessageListResponse {
  return {
    messages: [
      {
        lifecycleState,
        dstTxHash: null,
        dstZapSuccess: null,
        dstAmountIn: null,
        dstRefundedAmount: null,
        ...rest,
      },
    ],
    cursor: null,
  } as unknown as MessageListResponse;
}
const IN_FLIGHT = message('pending_attestation');
const ZAP_FAILED = message('zap_failed');
const delivered = (dstTxHash: string) =>
  message('confirmed', { dstTxHash, dstZapSuccess: true, dstAmountIn: '2500000' });

const queues = new Map<string, Array<MessageListResponse | Promise<MessageListResponse>>>();
function answer(hash: Hash, ...list: Array<MessageListResponse | Promise<MessageListResponse>>) {
  queues.set(hash, list);
}
const requestsFor = (hash: Hash) =>
  cctp.getTxStatusByTxHash.mock.calls.filter(([, txHash]) => txHash === hash).length;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  queues.clear();
  cctp.getTxStatusByTxHash.mockReset();
  cctp.getTxStatusByTxHash.mockImplementation(async (_networkChainId: number, hash: string) => {
    const queue = queues.get(hash);
    if (!queue?.length) {
      throw new Error(`no CCTP answer for ${hash}`);
    }
    return queue.length > 1 ? queue.shift() : queue[0];
  });
  rpc.getTransactionReceipt.mockReset();
  rpc.getTransactionReceipt.mockRejectedValue(new Error('no rpc in tests'));
  transactApi.fetchRecoveryQuote.mockReset();
  transactApi.fetchRecoveryQuote.mockResolvedValue({ allowances: [] } as unknown as RecoveryQuote);
  transactApi.fetchRecoveryStep.mockReset();
  transactApi.fetchRecoveryStep.mockResolvedValue({ ...sameChainStep, message: 'recovery' });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('pollCCTPBridgeStatus drives its own bridge', () => {
  it('to success once the destination is confirmed', async () => {
    const app = makeStore();
    answer(SRC_A, IN_FLIGHT, delivered(DST_A));
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));

    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.BridgingTx });
    expect(stepper(app).bridgeStatus).toMatchObject({
      srcTxHash: SRC_A,
      opId: 'op-a',
      lifecycleState: 'pending_attestation',
    });

    await nextPoll();
    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.SuccessTx });
    expect(stepper(app).bridgeStatus).toMatchObject({
      srcTxHash: SRC_A,
      opId: 'op-a',
      lifecycleState: 'confirmed',
      dstTxHash: DST_A,
    });
    expect(requestsFor(SRC_A)).toBe(2);
  });

  it('to dest-failed and recovery when the destination zap fails, then into its recovery stepper', async () => {
    const app = makeStore();
    answer(SRC_A, IN_FLIGHT, ZAP_FAILED);
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));
    await nextPoll();

    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.RecoveryTx });
    expect(stepper(app).bridgeStatus).toMatchObject({
      srcTxHash: SRC_A,
      opId: 'op-a',
      lifecycleState: 'zap_failed',
    });
    expect(opStatus(app, 'op-a')).toBe('dest-failed');
    expect(transactApi.fetchRecoveryQuote).toHaveBeenCalledTimes(1);
    expect(app.store.getState().ui.transact.crossChain.recoveryQuote.opId).toBe('op-a');

    await app.dispatch(crossChainRecoverySteps('op-a', t));
    await settle();
    expect(stepper(app)).toMatchObject({ modal: true, isRecoveryExecution: true });
    expect(stepper(app).items.map(item => item.message)).toEqual(['recovery']);
    expect(stepper(app).bridgeStatus).toMatchObject({ srcTxHash: SRC_A, opId: 'op-a' });

    await nextPoll();
    expect(requestsFor(SRC_A)).toBe(2);
  });

  it('to recovery when a two-step bridge is confirmed', async () => {
    const app = makeStore();
    answer(SRC_A, IN_FLIGHT, delivered(DST_A));
    await start(app, crossChainStep(makeOp('op-a', SRC_A, true)));
    await nextPoll();

    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.RecoveryTx });
    expect(stepper(app).bridgeStatus).toMatchObject({ opId: 'op-a', dstTxHash: DST_A });
    expect(opStatus(app, 'op-a')).toBe('dest-failed');
    expect(app.store.getState().ui.transact.crossChain.pendingOps['op-a'].recovery).toMatchObject({
      bridgedAmount: '2.5',
    });
  });
});

describe('pollCCTPBridgeStatus after the stepper is reset', () => {
  it('leaves a later same-chain attempt, waiting in the wallet, alone', async () => {
    const app = makeStore();
    answer(SRC_A, IN_FLIGHT, ZAP_FAILED);
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));
    expect(stepper(app).stepContent).toBe(StepContent.BridgingTx);

    walletDisconnected(app);
    await start(app, sameChainStep);
    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.WalletTx });

    await nextPoll();
    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.WalletTx });
    expect(stepper(app).bridgeStatus).toBeUndefined();
    expect(walletResult(app)).toBeUndefined();
    expect(opStatus(app, 'op-a')).toBe('source-done');
  });

  it('leaves a later cross-chain attempt, and its op, alone', async () => {
    const app = makeStore();
    answer(SRC_A, IN_FLIGHT, ZAP_FAILED);
    answer(SRC_B, IN_FLIGHT);
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));

    walletDisconnected(app);
    await start(app, crossChainStep(makeOp('op-b', SRC_B)));
    expect(stepper(app).bridgeStatus).toMatchObject({ srcTxHash: SRC_B, opId: 'op-b' });

    await nextPoll();
    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.BridgingTx });
    expect(stepper(app).bridgeStatus).toMatchObject({
      srcTxHash: SRC_B,
      opId: 'op-b',
      lifecycleState: 'pending_attestation',
    });
    expect(opStatus(app, 'op-b')).toBe('source-done');
    expect(opStatus(app, 'op-a')).toBe('source-done');
    expect(walletResult(app)).toBe('success');

    answer(SRC_B, delivered(DST_B));
    await nextPoll();
    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.SuccessTx });
    expect(stepper(app).bridgeStatus).toMatchObject({ srcTxHash: SRC_B, dstTxHash: DST_B });
    expect(opStatus(app, 'op-b')).toBe('source-done');
  });

  it('drops an answer that was in flight when the stepper was reset', async () => {
    const app = makeStore();
    let resolveAnswer: (value: MessageListResponse) => void = () => {};
    answer(SRC_A, new Promise<MessageListResponse>(resolve => (resolveAnswer = resolve)));
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));
    expect(stepper(app).stepContent).toBe(StepContent.BridgingTx);

    walletDisconnected(app);
    await start(app, sameChainStep);
    resolveAnswer(delivered(DST_A));
    await settle();

    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.WalletTx });
    expect(stepper(app).bridgeStatus).toBeUndefined();
    expect(walletResult(app)).toBeUndefined();
  });

  it('stops asking the CCTP API', async () => {
    const app = makeStore();
    answer(SRC_A, IN_FLIGHT);
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));
    expect(requestsFor(SRC_A)).toBe(1);

    walletDisconnected(app);
    await nextPoll();
    await nextPoll();
    expect(requestsFor(SRC_A)).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves the recovery of another op alone', async () => {
    const app = makeStore();
    const opZ = makeOp('op-z', SRC_B);
    app.dispatch(
      crossChainOpInitiated({
        ...opZ,
        status: 'dest-failed',
        recovery: { ...opZ.recovery, bridgedAmount: '42' },
      })
    );
    answer(SRC_A, IN_FLIGHT, message('zap_failed', { dstRefundedAmount: '7000000' }));
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));

    walletDisconnected(app);
    await app.dispatch(crossChainFetchRecoveryQuote({ opId: 'op-z' }));
    await app.dispatch(crossChainRecoverySteps('op-z', t));
    await settle();
    app.dispatch(stepperUpdateCurrentStep({ pending: true }));
    await app.dispatch(stepper(app).items[0].action);
    await settle();
    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.WalletTx });
    expect(stepper(app).bridgeStatus).toMatchObject({ opId: 'op-z', srcTxHash: SRC_B });

    await nextPoll();
    expect(stepper(app)).toMatchObject({ modal: true, stepContent: StepContent.WalletTx });
    expect(stepper(app).bridgeStatus?.lifecycleState).toBeUndefined();
    expect(app.store.getState().ui.transact.crossChain.pendingOps['op-z'].recovery).toMatchObject({
      bridgedAmount: '42',
    });
    expect(transactApi.fetchRecoveryQuote).toHaveBeenCalledTimes(1);
  });

  it('drops receipt lookups that return after the reset', async () => {
    const app = makeStore();
    let resolveReceipts: (value: { logs: [] }) => void = () => {};
    const receipts = new Promise<{ logs: [] }>(resolve => (resolveReceipts = resolve));
    rpc.getTransactionReceipt.mockImplementation(() => receipts);
    answer(SRC_A, delivered(DST_A));
    answer(SRC_B, IN_FLIGHT);
    await start(app, crossChainStep(makeOp('op-a', SRC_A)));
    expect(stepper(app).stepContent).toBe(StepContent.SuccessTx);

    walletDisconnected(app);
    await start(app, crossChainStep(makeOp('op-b', SRC_B)));
    resolveReceipts({ logs: [] });
    await settle();

    expect(stepper(app).bridgeStatus).toMatchObject({ srcTxHash: SRC_B, opId: 'op-b' });
    expect(stepper(app).bridgeStatus?.dstTokensReturned).toBeUndefined();
    expect(stepper(app).bridgeStatus?.srcTokensReturned).toBeUndefined();
  });
});
