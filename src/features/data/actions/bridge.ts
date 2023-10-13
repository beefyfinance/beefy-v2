import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBridgeApi, getConfigApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import { selectCurrentChainId, selectWalletAddress } from '../selectors/wallet';
import type { BeefyAnyBridgeConfig, BeefyBridgeConfig } from '../apis/config-types';
import { fetchBalanceAction } from './balance';
import {
  selectBridgeConfigById,
  selectBridgeConfirmQuote,
  selectBridgeFormState,
  selectBridgeIdsFromTo,
  selectBridgeQuoteById,
  selectBridgeQuoteSelectedId,
  selectBridgeSourceChainId,
  selectBridgeSupportedChainIds,
  selectBridgeDepositTokenForChainId,
  selectShouldLoadBridgeConfig,
} from '../selectors/bridge';
import type { BridgeFormState } from '../reducers/wallet/bridge';
import { FormStep } from '../reducers/wallet/bridge';
import { BIG_ONE, BIG_ZERO, fromWeiString } from '../../../helpers/big-number';
import { selectUserBalanceOfToken } from '../selectors/balance';
import { selectChainById } from '../selectors/chains';
import { orderBy, partition } from 'lodash-es';
import { isFulfilledResult } from '../../../helpers/promises';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import { fetchAllowanceAction } from './allowance';
import { selectAllowanceByTokenAddress } from '../selectors/allowances';
import type { Step } from '../reducers/wallet/stepper';
import { walletActions } from './wallet-actions';
import type { Namespace, TFunction } from 'react-i18next';
import { startStepperWithSteps } from './stepper';
import BigNumber from 'bignumber.js';

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

export const fetchBridgeConfig = createAsyncThunk<
  FetchBridgeChainPayload,
  FetchBridgeConfigParams,
  { state: BeefyState }
>('bridge/fetchBridgeConfig', async () => {
  const api = getConfigApi();
  return { config: await api.fetchBeefyBridgeConfig() };
});

type InitBridgeFormParams = {
  walletAddress: string | null;
};

type InitBridgeFormPayload = {
  form: BridgeFormState;
};

export const initiateBridgeForm = createAsyncThunk<
  InitBridgeFormPayload,
  InitBridgeFormParams,
  { state: BeefyState }
>('bridge/initiateBridgeForm', async ({ walletAddress }, { getState, dispatch }) => {
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
    },
  };
});

type ValidateBridgeFormParams = void;

type ValidateBridgeFormPayload = void;

export const validateBridgeForm = createAsyncThunk<
  ValidateBridgeFormPayload,
  ValidateBridgeFormParams,
  { state: BeefyState }
>('bridge/validateBridgeForm', async (_, { getState, dispatch }) => {
  const state = getState();

  const { from, input } = selectBridgeFormState(state);
  const fromToken = selectBridgeDepositTokenForChainId(state, from);

  const minAmount = fromWeiString('1000', fromToken.decimals);
  if (input.amount.lt(minAmount)) {
    throw new Error(`Minimum amount is ${minAmount} ${fromToken.symbol}`);
  }

  const userBalance = selectUserBalanceOfToken(state, fromToken.chainId, fromToken.address);
  if (input.amount.gt(userBalance)) {
    throw new Error('Insufficient balance');
  }

  dispatch(quoteBridgeForm());
});

type QuoteBridgeFormParams = void;

type QuoteBridgeFormPayload = {
  quotes: IBridgeQuote<BeefyAnyBridgeConfig>[];
  limitedQuotes: IBridgeQuote<BeefyAnyBridgeConfig>[];
};

export const quoteBridgeForm = createAsyncThunk<
  QuoteBridgeFormPayload,
  QuoteBridgeFormParams,
  {
    state: BeefyState;
    rejectValue: 'AllQuotesRateLimitedError';
    rejectedMeta: { current: BigNumber; max: BigNumber; canWait: boolean };
  }
>('bridge/quoteBridgeForm', async (_, { getState, rejectWithValue }) => {
  const state = getState();
  const { from, to, input } = selectBridgeFormState(state);
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
      throw rejectWithValue('AllQuotesRateLimitedError', getLimits(outLimits));
    }

    return { quotes: inLimits, limitedQuotes: outLimits };
  }

  if (rejected.length > 0) {
    throw rejected[0].reason;
  }

  throw new Error('No bridge quotes succeeded');
});

type ConfirmBridgeFormParams = void;

type ConfirmBridgeFormPayload = { quote: IBridgeQuote<BeefyAnyBridgeConfig> };

export const confirmBridgeForm = createAsyncThunk<
  ConfirmBridgeFormPayload,
  ConfirmBridgeFormParams,
  { state: BeefyState }
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
  const updatedQuote = await api.fetchQuote(quote.config, fromChain, toChain, quote.input, state);

  return {
    quote: updatedQuote,
  };
});

type PerformBridgeParams = { t: TFunction<Namespace> };

type PerformBridgePayload = void;

export const performBridge = createAsyncThunk<
  PerformBridgePayload,
  PerformBridgeParams,
  { state: BeefyState }
>('bridge/performBridge', async ({ t }, { getState, dispatch }) => {
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
        action: walletActions.approval(quote.allowance.token, quote.allowance.spenderAddress),
        pending: false,
      });
    }
  }

  const api = await getBridgeApi();
  steps.push(await api.fetchBridgeStep(quote, t, state));

  dispatch(startStepperWithSteps(steps, quote.input.token.chainId));
});
