import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBridgeApi, getConfigApi } from '../apis/instances';
import type { ChainEntity } from '../entities/chain';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddress,
} from '../selectors/wallet';
import type { BeefyBridgeConfig } from '../apis/config-types';
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
  selectBridgeTokenForChainId,
  selectShouldLoadBridgeConfig,
} from '../selectors/bridge';
import type { BridgeFormState } from '../reducers/wallet/bridge';
import { FormStep } from '../reducers/wallet/bridge';
import { BIG_ZERO, fromWeiString } from '../../../helpers/big-number';
import { selectUserBalanceOfToken } from '../selectors/balance';
import { selectChainById } from '../selectors/chains';
import { groupBy, partition, uniqBy } from 'lodash-es';
import { isFulfilledResult } from '../../../helpers/promises';
import type { IBridgeQuote } from '../apis/bridge/providers/provider-types';
import type { BeefyAnyBridgeConfig } from '../apis/config-types';
import { fetchAllowanceAction } from './allowance';
import { selectAllowanceByTokenAddress } from '../selectors/allowances';
import type { Step } from '../reducers/wallet/stepper';
import { walletActions } from './wallet-actions';
import type { Namespace, TFunction } from 'react-i18next';
import { startStepperWithSteps } from './stepper';

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

  if (walletAddress) {
    const chainId = selectCurrentChainId(state);
    if (supportedChainIds.includes(chainId)) {
      fromChainId = chainId;
      toChainId = supportedChainIds.filter(chainId => chainId !== fromChainId)[0];
    }
  }

  const fromToken = selectBridgeTokenForChainId(state, fromChainId);
  const toToken = selectBridgeTokenForChainId(state, toChainId);

  if (walletAddress) {
    for (const chainId of supportedChainIds) {
      dispatch(
        fetchBalanceAction({ chainId, tokens: [selectBridgeTokenForChainId(state, chainId)] })
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

type ValidateBridgeFormPayload = {
  status: 'valid' | 'invalid';
};

export const validateBridgeForm = createAsyncThunk<
  ValidateBridgeFormPayload,
  ValidateBridgeFormParams,
  { state: BeefyState }
>('bridge/validateBridgeForm', async (_, { getState, dispatch }) => {
  const state = getState();
  const walletConnected = selectIsWalletConnected(state);
  if (!walletConnected) {
    return {
      status: 'invalid',
    };
  }

  const { from, to, input } = selectBridgeFormState(state);
  const fromToken = selectBridgeTokenForChainId(state, from);
  const toToken = selectBridgeTokenForChainId(state, to);
  const minAmount = fromWeiString('1000', fromToken.decimals);
  if (input.amount.lt(minAmount)) {
    return {
      status: 'invalid',
    };
  }

  const userBalance = selectUserBalanceOfToken(state, fromToken.chainId, fromToken.address);
  if (input.amount.gt(userBalance)) {
    return {
      status: 'invalid',
    };
  }

  dispatch(quoteBridgeForm());

  return {
    status: 'valid',
  };
});

type QuoteBridgeFormParams = void;

type QuoteBridgeFormPayload = { quotes: IBridgeQuote<BeefyAnyBridgeConfig>[] };

export const quoteBridgeForm = createAsyncThunk<
  QuoteBridgeFormPayload,
  QuoteBridgeFormParams,
  { state: BeefyState }
>('bridge/quoteBridgeForm', async (_, { getState }) => {
  const state = getState();
  const { from, to, input } = selectBridgeFormState(state);
  const bridgeIds = selectBridgeIdsFromTo(state, from, to);
  const api = await getBridgeApi();
  const fromChain = selectChainById(state, from);
  const toChain = selectChainById(state, to);
  const walletAddress = selectWalletAddress(state);

  const quotes = await Promise.allSettled(
    bridgeIds.map(
      async bridgeId =>
        await api.fetchQuote(
          selectBridgeConfigById(state, bridgeId),
          fromChain,
          toChain,
          input,
          walletAddress,
          state
        )
    )
  );

  const [fulfilled, rejected] = partition(quotes, isFulfilledResult);
  const successfulQuotes = fulfilled
    .map(result => result.value)
    .filter(quote => !!quote)
    .flat();

  if (rejected.length > 0) {
    console.warn('Some bridge quotes failed', rejected);
  }

  if (successfulQuotes.length > 0) {
    return { quotes: successfulQuotes };
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

  // update allowances
  dispatch(
    fetchAllowanceAction({
      chainId: quote.allowance.token.chainId,
      spenderAddress: quote.allowance.spenderAddress,
      tokens: [quote.allowance.token],
      walletAddress,
    })
  );

  return {
    quote,
  };
});

type PerformBridgeParams = { t: TFunction<Namespace> };

type PerformBridgePayload = {};

export const performBridge = createAsyncThunk<
  PerformBridgePayload,
  PerformBridgeParams,
  { state: BeefyState }
>('bridge/performBridge', async ({ t }, { getState, dispatch }) => {
  const state = getState();
  const quote = selectBridgeConfirmQuote(state);
  const tokenAllowance = selectAllowanceByTokenAddress(
    state,
    quote.allowance.token.chainId,
    quote.allowance.token.address,
    quote.allowance.spenderAddress
  );

  const steps: Step[] = [];

  if (tokenAllowance.isLessThan(quote.allowance.amount)) {
    steps.push({
      step: 'approve',
      message: t('Vault-ApproveMsg'),
      action: walletActions.approval(quote.allowance.token, quote.allowance.spenderAddress),
      pending: false,
    });
  }

  const api = await getBridgeApi();
  steps.push(await api.fetchBridgeStep(quote, t, state));

  dispatch(startStepperWithSteps(steps, quote.input.token.chainId));
});

export function getBridgeTxData() {
  //
}
