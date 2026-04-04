import type { Address, Hash, PublicClient } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import BigNumber from 'bignumber.js';
import { groupBy, uniqBy } from 'lodash-es';
import { createAction } from '@reduxjs/toolkit';
import type { Namespace, TFunction } from 'react-i18next';
import { BeefyZapRouterAbi } from '../../../../config/abi/BeefyZapRouterAbi.ts';
import { ZERO_ADDRESS } from '../../../../helpers/addresses.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { getTransactApi, getWalletConnectionApi } from '../../apis/instances.ts';
import { rpcClientManager } from '../../apis/rpc-contract/rpc-manager.ts';
import { fetchWalletContract } from '../../apis/rpc-contract/viem-contract.ts';
import type { UserlessZapRequest, ZapOrder, ZapStep } from '../../apis/transact/zap/types.ts';
import { isTokenErc20, type TokenEntity } from '../../entities/token.ts';
import type { VaultEntity } from '../../entities/vault.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { GasPricing } from '../../apis/gas-prices/gas-prices.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import { selectAllowanceByTokenAddress } from '../../selectors/allowances.ts';
import { selectChainById } from '../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectTokenByAddress,
  selectTokenByAddressOrUndefined,
} from '../../selectors/tokens.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import { selectCurrentChainId, selectWalletAddress } from '../../selectors/wallet.ts';
import { selectZapByChainId } from '../../selectors/zap.ts';
import type { BeefyState, BeefyThunk } from '../../store/types.ts';
import { getGasPriceOptions } from '../../utils/gas-utils.ts';
import type {
  CrossChainOpStatus,
  CrossChainRecoveryParams,
  PendingCrossChainOp,
} from '../../reducers/wallet/transact-types.ts';
import type {
  RecoveryQuote,
  TokenAmount,
  ZapQuoteStep,
} from '../../apis/transact/transact-types.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';
import { fetchAllowanceAction } from '../allowance.ts';
import { transactSetExecuting } from '../transact.ts';
import { bindTransactionEvents, captureWalletErrors, txStart, txWallet } from './common.ts';
import { approve } from './approval.ts';
import { stepperSetRecoveryExecution, stepperStartWithSteps } from './stepper.ts';

type GasPriceCache = {
  chainId: ChainEntity['id'];
  promise: Promise<GasPricing>;
  timestamp: number;
};

const GAS_PRICE_TTL_MS = 30_000;
let gasPriceCache: GasPriceCache | null = null;

/** Kick off a gas price fetch that can be consumed later by crossChainZapExecuteOrder */
export function prefetchGasPrice(chain: ChainEntity): void {
  gasPriceCache = {
    chainId: chain.id,
    promise: getGasPriceOptions(chain),
    timestamp: Date.now(),
  };
  // Suppress unhandled rejection if nobody consumes this
  gasPriceCache.promise.catch(() => {});
}

async function getPrefetchedOrFreshGasPrice(chain: ChainEntity): Promise<GasPricing> {
  const cached = gasPriceCache;
  gasPriceCache = null; // consume once

  if (cached && cached.chainId === chain.id && Date.now() - cached.timestamp < GAS_PRICE_TTL_MS) {
    try {
      return await cached.promise;
    } catch (err) {
      // Prefetch failed — fall back to fresh
      console.warn('[cross-chain] Gas price prefetch failed, fetching fresh', err);
    }
  }

  return getGasPriceOptions(chain);
}

export type CrossChainExecuteMetadata = {
  opId: string;
  direction: 'deposit' | 'withdraw';
  sourceChainId: ChainEntity['id'];
  destChainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  sourceInput: TokenAmount;
  expectedOutput: TokenAmount;
  sourceDisplaySteps: ZapQuoteStep[];
  destDisplaySteps: ZapQuoteStep[];
  recovery: CrossChainRecoveryParams;
};

/**
 * Execute a zap order on a source chain different from the vault's chain.
 * Modeled after zapExecuteOrder but uses sourceChainId for chain/zap/rpc lookups.
 */
export const crossChainZapExecuteOrder = (
  sourceChainId: ChainEntity['id'],
  vaultId: VaultEntity['id'],
  params: UserlessZapRequest,
  expectedTokens: TokenEntity[],
  metadata: CrossChainExecuteMetadata
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    console.log('[cross-chain] crossChainZapExecuteOrder: start', { sourceChainId, vaultId });
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error(`No wallet connected`);
    }

    // Validate user is on source chain
    const currentChainId = selectCurrentChainId(state);
    if (currentChainId !== sourceChainId) {
      const sourceChain = selectChainById(state, sourceChainId);
      throw new Error(
        `Please switch to ${sourceChain.name} to execute this cross-chain transaction`
      );
    }
    console.log('[cross-chain] crossChainZapExecuteOrder: validation passed');

    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, sourceChainId);
    const zap = selectZapByChainId(state, sourceChainId);
    if (!zap) {
      throw new Error(`No zap found for chain ${chain.id}`);
    }
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const order: ZapOrder = {
      ...params.order,
      inputs: params.order.inputs.filter(i => BIG_ZERO.lt(i.amount)),
      user: address,
      recipient: address,
    };
    if (!order.inputs.length) {
      throw new Error('No inputs provided');
    }

    // @dev key order must match actual function / `components` in ABI
    const castedOrder = {
      inputs: params.order.inputs
        .filter(i => BIG_ZERO.lt(i.amount))
        .map(i => ({
          token: i.token as Address,
          amount: BigInt(i.amount),
        })),
      outputs: params.order.outputs.map(o => ({
        token: o.token as Address,
        minOutputAmount: BigInt(o.minOutputAmount),
      })),
      relay: {
        target: params.order.relay.target as Address,
        value: BigInt(params.order.relay.value),
        data: params.order.relay.data as `0x${string}`,
      },
      user: address as Address,
      recipient: address as Address,
    };

    const steps: ZapStep[] = params.steps;
    if (!steps.length) {
      throw new Error('No steps provided');
    }

    // @dev key order must match actual function / `components` in ABI
    const castedSteps = params.steps.map(step => ({
      target: step.target as Address,
      value: BigInt(step.value),
      data: step.data as `0x${string}`,
      tokens: step.tokens.map(t => ({
        token: t.token as Address,
        index: t.index,
      })),
    }));

    console.log('[cross-chain] crossChainZapExecuteOrder: order/steps cast');
    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(sourceChainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const gasPrices = await getPrefetchedOrFreshGasPrice(chain);
    console.log('[cross-chain] crossChainZapExecuteOrder: gas price fetched');
    const nativeInput = castedOrder.inputs.find(input => input.token === ZERO_ADDRESS);

    const contract = fetchWalletContract(zap.router, BeefyZapRouterAbi, walletClient);
    const options = {
      ...gasPrices,
      account: castedOrder.user,
      chain: publicClient.chain,
      value: nativeInput ? nativeInput.amount : undefined,
    };

    // Dispatch cross-chain op tracking before wallet prompt
    const now = Date.now();
    dispatch(
      crossChainOpInitiated({
        id: metadata.opId,
        status: 'source-pending',
        direction: metadata.direction,
        sourceChainId: metadata.sourceChainId,
        destChainId: metadata.destChainId,
        vaultId: metadata.vaultId,
        sourceTxHash: '',
        sourceInput: metadata.sourceInput,
        expectedOutput: metadata.expectedOutput,
        sourceDisplaySteps: metadata.sourceDisplaySteps,
        destDisplaySteps: metadata.destDisplaySteps,
        recovery: metadata.recovery,
        createdAt: now,
        updatedAt: now,
      })
    );

    console.log('[cross-chain] crossChainZapExecuteOrder: prompting wallet');
    txWallet(dispatch);
    const transaction = contract.write.executeOrder([castedOrder, castedSteps], options);

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'zap',
        amount: BIG_ZERO,
        token: depositToken,
        expectedTokens,
        vaultId: vault.id,
      },
      {
        walletAddress: address,
        chainId: sourceChainId,
        spenderAddress: zap.manager,
        tokens: selectCrossChainZapTokensToRefresh(state, sourceChainId, order),
        clearInput: false,
      }
    );

    // Track cross-chain op lifecycle alongside bindTransactionEvents
    bindCrossChainOpTracking(dispatch, transaction, publicClient, metadata.opId);
    console.log('[cross-chain] crossChainZapExecuteOrder: tx submitted, tracking bound');
  });
};

/**
 * Execute a recovery zap order on the destination chain.
 * Used when the destination portion of a cross-chain zap has failed.
 */
export const crossChainRecoveryExecuteOrder = (
  opId: string,
  destChainId: ChainEntity['id'],
  vaultId: VaultEntity['id'],
  params: UserlessZapRequest,
  expectedTokens: TokenEntity[]
) => {
  return captureWalletErrors(async (dispatch, getState) => {
    txStart(dispatch);
    const state = getState();
    const address = selectWalletAddress(state);
    if (!address) {
      throw new Error('No wallet connected');
    }

    const currentChainId = selectCurrentChainId(state);
    if (currentChainId !== destChainId) {
      const destChain = selectChainById(state, destChainId);
      throw new Error(`Please switch to ${destChain.name} to execute this recovery transaction`);
    }

    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, destChainId);
    const zap = selectZapByChainId(state, destChainId);
    if (!zap) {
      throw new Error(`No zap found for chain ${chain.id}`);
    }
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const order: ZapOrder = {
      ...params.order,
      inputs: params.order.inputs.filter(i => BIG_ZERO.lt(i.amount)),
      user: address,
      recipient: address,
    };
    if (!order.inputs.length) {
      throw new Error('No inputs provided');
    }

    // @dev key order must match actual function / `components` in ABI
    const castedOrder = {
      inputs: params.order.inputs
        .filter(i => BIG_ZERO.lt(i.amount))
        .map(i => ({
          token: i.token as Address,
          amount: BigInt(i.amount),
        })),
      outputs: params.order.outputs.map(o => ({
        token: o.token as Address,
        minOutputAmount: BigInt(o.minOutputAmount),
      })),
      relay: {
        target: params.order.relay.target as Address,
        value: BigInt(params.order.relay.value),
        data: params.order.relay.data as `0x${string}`,
      },
      user: address as Address,
      recipient: address as Address,
    };

    const steps: ZapStep[] = params.steps;
    if (!steps.length) {
      throw new Error('No steps provided');
    }

    // @dev key order must match actual function / `components` in ABI
    const castedSteps = params.steps.map(step => ({
      target: step.target as Address,
      value: BigInt(step.value),
      data: step.data as `0x${string}`,
      tokens: step.tokens.map(t => ({
        token: t.token as Address,
        index: t.index,
      })),
    }));

    const walletApi = await getWalletConnectionApi();
    const publicClient = rpcClientManager.getBatchClient(destChainId);
    const walletClient = await walletApi.getConnectedViemClient();
    const gasPrices = await getGasPriceOptions(chain);
    const nativeInput = castedOrder.inputs.find(input => input.token === ZERO_ADDRESS);

    const contract = fetchWalletContract(zap.router, BeefyZapRouterAbi, walletClient);
    const options = {
      ...gasPrices,
      account: castedOrder.user,
      chain: publicClient.chain,
      value: nativeInput ? nativeInput.amount : undefined,
    };

    dispatch(crossChainOpStatusUpdate({ id: opId, status: 'dest-pending' }));

    txWallet(dispatch);
    const transaction = contract.write.executeOrder([castedOrder, castedSteps], options);

    bindTransactionEvents(
      dispatch,
      transaction,
      publicClient,
      {
        type: 'zap',
        amount: BIG_ZERO,
        token: depositToken,
        expectedTokens,
        vaultId: vault.id,
      },
      {
        walletAddress: address,
        chainId: destChainId,
        spenderAddress: zap.manager,
        tokens: expectedTokens,
        clearInput: false,
      }
    );

    // Track recovery outcome
    transaction
      .then(hash => {
        waitForTransactionReceipt(publicClient, { hash })
          .then(receipt => {
            if (receipt.status === 'success') {
              dispatch(
                crossChainOpStatusUpdate({
                  id: opId,
                  status: 'dest-recovered',
                  destTxHash: hash,
                })
              );
            } else {
              dispatch(crossChainOpStatusUpdate({ id: opId, status: 'dest-failed' }));
            }
          })
          .catch(err => {
            // Receipt fetch failed — leave status as dest-pending for retry
            console.warn(`[cross-chain] Recovery receipt fetch failed for op ${opId} `, err);
          });
      })
      .catch(() => {
        dispatch(crossChainOpStatusUpdate({ id: opId, status: 'dest-failed' }));
      });
  });
};

/**
 * Track cross-chain op lifecycle: capture tx hash on submission,
 * transition to source-done on successful mining, dismiss on rejection.
 */
function bindCrossChainOpTracking(
  dispatch: (action: unknown) => void,
  transactionHashPromise: Promise<Hash>,
  client: PublicClient,
  opId: string
) {
  transactionHashPromise
    .then(hash => {
      dispatch(
        crossChainOpStatusUpdate({ id: opId, status: 'source-pending', sourceTxHash: hash })
      );
      waitForTransactionReceipt(client, { hash })
        .then(receipt => {
          if (receipt.status === 'success') {
            dispatch(crossChainOpStatusUpdate({ id: opId, status: 'source-done' }));
          } else {
            dispatch(crossChainOpStatusUpdate({ id: opId, status: 'source-failed' }));
          }
        })
        .catch(err => {
          console.warn(
            `[cross-chain] Receipt fetch failed for op ${opId}, status may be stale`,
            err
          );
        });
    })
    .catch(err => {
      console.warn(`[cross-chain] Transaction rejected/failed for op ${opId}`, err);
      dispatch(crossChainOpDismiss({ id: opId }));
    });
}

/** Source-chain tokens whose balances should be refreshed after the source tx is mined.
 * Dest-chain token refresh is handled separately by cross-chain operation polling. */
function selectCrossChainZapTokensToRefresh(
  state: BeefyState,
  sourceChainId: ChainEntity['id'],
  order: ZapOrder
): TokenEntity[] {
  const tokens: TokenEntity[] = [selectChainNativeToken(state, sourceChainId)];

  for (const { token: tokenAddress } of order.inputs) {
    const token = selectTokenByAddressOrUndefined(state, sourceChainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  for (const { token: tokenAddress } of order.outputs) {
    const token = selectTokenByAddressOrUndefined(state, sourceChainId, tokenAddress);
    if (token) {
      tokens.push(token);
    }
  }

  return uniqBy(tokens, 'id');
}

// Action creators for cross-chain pending operations
export const crossChainOpInitiated = createAction<PendingCrossChainOp>('cross-chain/initiated');

export const crossChainOpStatusUpdate = createAction<{
  id: string;
  status: CrossChainOpStatus;
  destTxHash?: string;
  sourceTxHash?: string;
  recoveryBridgedAmount?: string;
}>('cross-chain/statusUpdate');

export const crossChainOpDismiss = createAction<{ id: string }>('cross-chain/dismiss');

export const crossChainClearRecoveryQuote = createAction('cross-chain/clearRecoveryQuote');

// ---------------------------------------------------------------------------
// Recovery: quote + step thunks
// ---------------------------------------------------------------------------

type CrossChainFetchRecoveryQuotePayload = {
  quote: RecoveryQuote;
};

type CrossChainFetchRecoveryQuoteArgs = {
  opId: string;
};

export const crossChainFetchRecoveryQuote = createAppAsyncThunk<
  CrossChainFetchRecoveryQuotePayload,
  CrossChainFetchRecoveryQuoteArgs
>('cross-chain/fetchRecoveryQuote', async ({ opId }, { getState }) => {
  const state = getState();
  const op = state.ui.transact.crossChain.pendingOps[opId];
  if (!op) {
    throw new Error(`No pending cross-chain op with id ${opId}`);
  }
  if (op.status !== 'dest-failed') {
    throw new Error(`Op ${opId} is not in dest-failed state`);
  }

  const api = await getTransactApi();
  const actualBridgedAmount = new BigNumber(op.recovery.bridgedAmount);
  const quote = await api.fetchRecoveryQuote(op.recovery, actualBridgedAmount, getState);

  return { quote };
});

export function crossChainRecoverySteps(opId: string, t: TFunction<Namespace>): BeefyThunk {
  return captureWalletErrors(async (dispatch, getState) => {
    dispatch(transactSetExecuting(true));
    try {
      txStart(dispatch);
      const state = getState();
      const op = state.ui.transact.crossChain.pendingOps[opId];
      if (!op) {
        throw new Error(`No pending cross-chain op with id ${opId}`);
      }

      console.debug('[Recovery] Starting recovery steps for op', opId, {
        bridgedAmount: op.recovery.bridgedAmount,
        destChainId: op.recovery.destChainId,
      });

      const api = await getTransactApi();
      const actualBridgedAmount = new BigNumber(op.recovery.bridgedAmount);

      const steps: Step[] = [];

      const rqState = state.ui.transact.crossChain.recoveryQuote;
      if (rqState.opId === opId && rqState.quote) {
        const allowanceRequirements = rqState.quote.allowances.filter(
          a => isTokenErc20(a.token) && a.amount.gt(BIG_ZERO)
        );
        if (allowanceRequirements.length > 0) {
          const walletAddress = selectWalletAddress(state);
          if (walletAddress) {
            const uniqueAllowances = uniqBy(
              allowanceRequirements.map(a => ({
                token: a.token,
                spenderAddress: a.spenderAddress,
              })),
              a => `${a.token.chainId}-${a.spenderAddress}-${a.token.address}`
            );
            const allowancesPerChainSpender = groupBy(
              uniqueAllowances,
              a => `${a.token.chainId}-${a.spenderAddress}`
            );
            await Promise.all(
              Object.values(allowancesPerChainSpender).map(allowances =>
                dispatch(
                  fetchAllowanceAction({
                    chainId: allowances[0].token.chainId,
                    spenderAddress: allowances[0].spenderAddress,
                    tokens: allowances.map(a => a.token),
                    walletAddress,
                  })
                )
              )
            );
          }
          const stateAfterFetch = getState();
          for (const allowanceTokenAmount of allowanceRequirements) {
            const allowance = selectAllowanceByTokenAddress(
              stateAfterFetch,
              allowanceTokenAmount.token.chainId,
              allowanceTokenAmount.token.address,
              allowanceTokenAmount.spenderAddress
            );
            if (allowance.lt(allowanceTokenAmount.amount)) {
              steps.push({
                step: 'approve',
                message: t('Vault-ApproveMsg'),
                action: approve(
                  allowanceTokenAmount.token,
                  allowanceTokenAmount.spenderAddress,
                  allowanceTokenAmount.amount
                ),
                pending: false,
              });
            }
          }
        }
      }

      console.debug('[Recovery] Fetching recovery step...');
      const recoveryStep = await api.fetchRecoveryStep(
        op.recovery,
        opId,
        actualBridgedAmount,
        getState,
        t
      );
      steps.push(recoveryStep);

      console.debug('[Recovery] Starting stepper with', steps.length, 'steps');
      dispatch(transactSetExecuting(false));
      dispatch(stepperStartWithSteps(steps, op.recovery.destChainId));
      dispatch(stepperSetRecoveryExecution(true));
    } finally {
      dispatch(transactSetExecuting(false));
    }
  });
}
