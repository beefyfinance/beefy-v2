import BigNumber from 'bignumber.js';
import { orderBy, partition } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { isAddress } from 'viem';
import { BIG_ONE, BIG_ZERO, fromWei } from '../../../helpers/big-number.ts';
import { isFulfilledResult } from '../../../helpers/promises.ts';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types.ts';
import type { BeefyAnyBridgeConfig, BeefyBridgeConfig } from '../apis/config-types.ts';
import { getBridgeApi, getConfigApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { type BridgeFormState, FormStep } from '../reducers/wallet/bridge-types.ts';
import type { Step } from '../reducers/wallet/stepper-types.ts';
import { selectAllowanceByTokenAddress } from '../selectors/allowances.ts';
import {
  selectBridgeConfigById,
  selectBridgeConfirmQuote,
  selectBridgeDepositTokenForChainId,
  selectBridgeFormState,
  selectBridgeIdsFromTo,
  selectBridgeQuoteById,
  selectBridgeQuoteSelectedId,
  selectBridgeSourceChainId,
  selectBridgeSupportedChainIds,
  selectShouldLoadBridgeConfig,
} from '../selectors/bridge.ts';
import { selectChainById } from '../selectors/chains.ts';
import { selectCurrentChainId, selectWalletAddress } from '../selectors/wallet.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { fetchAllowanceAction } from './allowance.ts';
import { fetchBalanceAction } from './balance.ts';
import { stepperStartWithSteps } from './wallet/stepper.ts';
import { approve } from './wallet/approval.ts';

function getLimits(quotes: IBridgeQuote<BeefyAnyBridgeConfig>[]) {
  const current = BigNumber.max(
    ...quotes.map(q => BigNumber.min(q.limits.from.current, q.limits.to.current))
  );
  const max = BigNumber.max(...quotes.map(q => BigNumber.min(q.limits.from.max, q.limits.to.max)));
  const wanted = quotes[0].input.amount;
  const canWait = max.minus(current).gt(BIG_ONE) && max.gt(wanted);

  return { current, max, canWait };
}

export type FetchBridgeConfigParams = void;

export type FetchBridgeChainPayload = {
  config: BeefyBridgeConfig;
};

export const fetchBridgeConfig = createAppAsyncThunk<
  FetchBridgeChainPayload,
  FetchBridgeConfigParams
>('bridge/fetchBridgeConfig', async () => {
  const api = await getConfigApi();
  return { config: await api.fetchBeefyBridgeConfig() };
});

type InitBridgeFormParams = {
  walletAddress: string | undefined;
};

type InitBridgeFormPayload = {
  form: BridgeFormState;
};

export const initiateBridgeForm = createAppAsyncThunk<InitBridgeFormPayload, InitBridgeFormParams>(
  'bridge/initiateBridgeForm',
  async ({ walletAddress }, { getState, dispatch }) => {
    if (selectShouldLoadBridgeConfig(getState())) {
      await dispatch(fetchBridgeConfig());
    }

    const state = getState();
    const supportedChainIds = selectBridgeSupportedChainIds(state);

    let fromChainId: ChainEntity['id'] = selectBridgeSourceChainId(state);
    let toChainId: ChainEntity['id'] = supportedChainIds.filter(
      chainId => chainId !== fromChainId
    )[0];

    const chainId = selectCurrentChainId(state);
    if (chainId && supportedChainIds.includes(chainId)) {
      fromChainId = chainId;
      toChainId = supportedChainIds.filter(chainId => chainId !== fromChainId)[0];
    }

    const fromToken = selectBridgeDepositTokenForChainId(state, fromChainId);
    const toToken = selectBridgeDepositTokenForChainId(state, toChainId);

    if (walletAddress) {
      for (const chainId of supportedChainIds) {
        dispatch(
          fetchBalanceAction({
            chainId,
            tokens: [selectBridgeDepositTokenForChainId(state, chainId)],
          })
        );
      }
    }

    return {
      form: {
        step: FormStep.Preview,
        from: fromChainId,
        to: toChainId,
        input: {
          token: fromToken,
          amount: BIG_ZERO,
          max: false,
        },
        output: {
          token: toToken,
          amount: BIG_ZERO,
        },
        receiverIsDifferent: false,
        receiverAddress: undefined,
      },
    };
  }
);

type ValidateBridgeFormParams = void;

type ValidateBridgeFormPayload = void;

export const validateBridgeForm = createAppAsyncThunk<
  ValidateBridgeFormPayload,
  ValidateBridgeFormParams
>('bridge/validateBridgeForm', async (_, { getState, dispatch }) => {
  const state = getState();

  const { from, input, receiverIsDifferent, receiverAddress } = selectBridgeFormState(state);
  const fromToken = selectBridgeDepositTokenForChainId(state, from);

  const minAmount = fromWei('1000', fromToken.decimals);
  if (input.amount.lt(minAmount)) {
    throw new Error(`Minimum amount is ${minAmount} ${fromToken.symbol}`);
  }

  if (receiverIsDifferent) {
    if (!receiverAddress) {
      throw new Error('Receiver address is required');
    }
    if (!isAddress(receiverAddress, { strict: true })) {
      throw new Error('Receiver address is invalid');
    }
  }

  dispatch(quoteBridgeForm());
});

type QuoteBridgeFormParams = void;

type QuoteBridgeFormPayload = {
  quotes: IBridgeQuote<BeefyAnyBridgeConfig>[];
  limitedQuotes: IBridgeQuote<BeefyAnyBridgeConfig>[];
};

export const quoteBridgeForm = createAppAsyncThunk<
  QuoteBridgeFormPayload,
  QuoteBridgeFormParams,
  {
    state: BeefyState;
    rejectValue: 'AllQuotesRateLimitedError';
    rejectedMeta: {
      current: BigNumber;
      max: BigNumber;
      canWait: boolean;
    };
  }
>('bridge/quoteBridgeForm', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const { from, to, input, receiverIsDifferent, receiverAddress } = selectBridgeFormState(state);
  const bridgeIds = selectBridgeIdsFromTo(state, from, to);
  const api = await getBridgeApi();
  const fromChain = selectChainById(state, from);
  const toChain = selectChainById(state, to);

  const quotes = await Promise.allSettled(
    bridgeIds.map(
      async bridgeId =>
        await api.fetchQuote(
          selectBridgeConfigById(state, bridgeId),
          fromChain,
          toChain,
          input,
          receiverIsDifferent ? receiverAddress : undefined,
          state
        )
    )
  );

  const [fulfilled, rejected] = partition(quotes, isFulfilledResult);
  const successfulQuotes = fulfilled.map(result => result.value).filter(quote => !!quote);

  if (rejected.length > 0) {
    const errorBridgeIndexes = quotes
      .map((result, i) => (result.status === 'rejected' ? i : -1))
      .filter(i => i in bridgeIds);
    const bridgeErrors = rejected.map((result, i) => ({
      bridge: bridgeIds[errorBridgeIndexes[i]],
      reason: result.reason,
    }));
    console.warn('Some bridge quotes failed', bridgeErrors);
  }

  if (successfulQuotes.length > 0) {
    const sortedQuotes = orderBy(
      successfulQuotes,
      [
        quote => quote.output.amount.toNumber(),
        quote => quote.timeEstimate,
        quote => quote.fee.amount.toNumber(),
      ],
      ['desc', 'asc', 'asc']
    );
    const [inLimits, outLimits] = partition(sortedQuotes, q => q.withinLimits);

    if (inLimits.length === 0) {
      return rejectWithValue('AllQuotesRateLimitedError', getLimits(outLimits));
    }

    return { quotes: inLimits, limitedQuotes: outLimits };
  }

  if (rejected.length > 0) {
    throw rejected[0].reason;
  }

  throw new Error('No bridge quotes succeeded');
});

type ConfirmBridgeFormParams = void;

type ConfirmBridgeFormPayload = {
  quote: IBridgeQuote<BeefyAnyBridgeConfig>;
};

export const confirmBridgeForm = createAppAsyncThunk<
  ConfirmBridgeFormPayload,
  ConfirmBridgeFormParams
>('bridge/confirmBridgeForm', async (_, { getState, dispatch }) => {
  const state = getState();
  const quoteId = selectBridgeQuoteSelectedId(state);
  if (!quoteId) {
    throw new Error('No quote selected');
  }
  const quote = selectBridgeQuoteById(state, quoteId);
  if (!quote) {
    throw new Error('No quote found');
  }
  const walletAddress = selectWalletAddress(state);
  if (!walletAddress) {
    throw new Error('Not connected');
  }

  // update allowances
  if (quote.allowance) {
    dispatch(
      fetchAllowanceAction({
        chainId: quote.allowance.token.chainId,
        spenderAddress: quote.allowance.spenderAddress,
        tokens: [quote.allowance.token],
        walletAddress,
      })
    );
  }

  // update quote
  const api = await getBridgeApi();
  const fromChain = selectChainById(state, quote.input.token.chainId);
  const toChain = selectChainById(state, quote.output.token.chainId);
  const updatedQuote = await api.fetchQuote(
    quote.config,
    fromChain,
    toChain,
    quote.input,
    quote.receiver,
    state
  );

  return {
    quote: updatedQuote,
  };
});

type PerformBridgeParams = {
  t: TFunction<Namespace>;
};

type PerformBridgePayload = void;

export const performBridge = createAppAsyncThunk<PerformBridgePayload, PerformBridgeParams>(
  'bridge/performBridge',
  async ({ t }, { getState, dispatch }) => {
    const state = getState();
    const quote = selectBridgeConfirmQuote(state);
    const steps: Step[] = [];

    if (quote.allowance) {
      const tokenAllowance = selectAllowanceByTokenAddress(
        state,
        quote.allowance.token.chainId,
        quote.allowance.token.address,
        quote.allowance.spenderAddress
      );
      if (tokenAllowance.isLessThan(quote.allowance.amount)) {
        steps.push({
          step: 'approve',
          message: t('Vault-ApproveMsg'),
          action: approve(
            quote.allowance.token,
            quote.allowance.spenderAddress,
            quote.allowance.amount
          ),
          pending: false,
        });
      }
    }

    const api = await getBridgeApi();
    steps.push(await api.fetchBridgeStep(quote, t, state));

    dispatch(stepperStartWithSteps(steps, quote.input.token.chainId));
  }
);
