import type { IStrategy, SingleStrategyOptions, ZapTransactHelpers } from '../IStrategy';
import {
  type InputTokenAmount,
  isZapQuoteStepBridge,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepWithdraw,
  type StargateCrossChainSingleDepositOption,
  type StargateCrossChainSingleDepositQuote,
  type StargateCrossChainSingleWithdrawOption,
  type StargateCrossChainSingleWithdrawQuote,
  type TokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepBridge,
  type ZapQuoteStepSwap,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import {
  isTokenEqual,
  isTokenErc20,
  type TokenEntity,
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyAssetCount,
  onlyOneInput,
  onlyOneToken,
  onlyVaultStandard,
} from '../../helpers/options';
import { first, groupBy, uniqBy } from 'lodash-es';
import {
  BIG_ZERO,
  fromWei,
  fromWeiString,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes';
import { selectTransactSlippage } from '../../../../selectors/transact';
import { walletActions } from '../../../../actions/wallet-actions';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepResponse,
} from '../../zap/types';
import { getInsertIndex, getTokenAddress, NO_RELAY } from '../../helpers/zap';
import type { Step } from '../../../../reducers/wallet/stepper';
import type { Namespace, TFunction } from 'react-i18next';
import { getVaultWithdrawnFromState } from '../../helpers/vault';
import { isStandardVault } from '../../../../entities/vault';
import { mergeTokenAmounts, slipBy } from '../../helpers/amounts';
import { uniqueTokens, wnativeToNative } from '../../helpers/tokens';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectTokenByAddress,
  selectTokenByAddressOrUndefined,
} from '../../../../selectors/tokens';
import { fetchZapAggregatorSwap } from '../../zap/swap';
import type { ChainEntity } from '../../../../entities/chain';
import { selectChainById } from '../../../../selectors/chains';
import { stargateConfigs, stargatePaths, stargatePools } from './config';
import { isDefined } from '../../../../utils/array-utils';
import {
  type LibraryGetFeesResult,
  LibraryGetFeesResultKey,
  type StargatePath,
  StargateZapType,
} from './types';
import BigNumber from 'bignumber.js';
import { getWeb3Instance } from '../../../instances';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import { StargateFeeLibraryAbi } from '../../../../../../config/abi/StargateFeeLibraryAbi';
import { ZERO_ADDRESS } from '../../../../../../helpers/addresses';
import abiCoder from 'web3-eth-abi';
import { StargateComposerAbi } from '../../../../../../config/abi/StargateComposerAbi';
import { entries } from '../../../../../../helpers/object';
import type { QuoteRequest } from '../../swap/ISwapProvider';
import { Balances } from '../../helpers/Balances';
import { selectWalletAddress } from '../../../../selectors/wallet';
import { selectZapByChainId, selectZapByChainIdOrUndefined } from '../../../../selectors/zap';

type ZapHelpers = {
  slippage: number;
  state: BeefyState;
  direction: StargateZapType;
  path: StargatePath;
};

export class StargateCrossChainSingleStrategy implements IStrategy {
  public readonly id = 'stargate-crosschain-single';
  protected readonly wnative: TokenErc20;
  protected readonly native: TokenNative;
  protected readonly depositToken: TokenEntity;
  protected readonly paths: StargatePath[];

  constructor(protected options: SingleStrategyOptions, protected helpers: ZapTransactHelpers) {
    // Make sure zap was configured correctly for this vault
    const { vault, getState } = this.helpers;

    if (!onlyVaultStandard(vault)) {
      return; // type check
    }
    onlyAssetCount(vault, 1);

    // configure
    const state = getState();
    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
    this.depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    this.paths = this.selectPaths(state);
  }

  async fetchDepositOptions(): Promise<StargateCrossChainSingleDepositOption[]> {
    const { vault, vaultType } = this.helpers;
    const tokens = await this.fetchDepositTokens();
    const outputs = [vaultType.depositToken];

    return tokens.map(token => {
      const inputs = [token];
      const selectionId = createSelectionId(token.chainId, inputs);

      return {
        id: createOptionId('stargate-crosschain-single', vault.id, selectionId),
        vaultId: vault.id,
        chainId: token.chainId,
        selectionId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: outputs,
        strategyId: 'stargate-crosschain-single',
        mode: TransactMode.Deposit,
      };
    });
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: StargateCrossChainSingleDepositOption
  ): Promise<StargateCrossChainSingleDepositQuote> {
    const { vault, swapAggregator, vaultType, getState } = this.helpers;

    // Input
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    // Token Allowances
    const state = getState();
    const sourceZap = selectZapByChainId(state, input.token.chainId);
    const allowances = isTokenErc20(input.token)
      ? [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: sourceZap.manager,
          },
        ]
      : [];

    // Swap + Output
    const depositToken = vaultType.depositToken;
    const stargateDepositToken = this.toNative(state, depositToken);
    const paths = this.paths.filter(
      p =>
        p.canDeposit &&
        p.source.chainId === input.token.chainId &&
        p.dest.chainId === stargateDepositToken.chainId &&
        p.dest.tokenAddress === stargateDepositToken.address
    );
    if (!paths) {
      throw new Error(
        `No paths from ${input.token.chainId} to ${stargateDepositToken.symbol} on ${stargateDepositToken.chainId}`
      );
    }

    // Swap quotes
    const quoteRequestsPerPath: (QuoteRequest | undefined)[] = paths.map(path =>
      isTokenEqual(path.source.token, input.token)
        ? undefined
        : {
            vaultId: vault.id,
            fromToken: input.token,
            fromAmount: input.amount,
            toToken: path.source.token,
          }
    );

    const quotesPerPath = await Promise.all(
      quoteRequestsPerPath.map(async quoteRequest => {
        if (!quoteRequest) {
          return undefined;
        }

        return await swapAggregator.fetchQuotes(quoteRequest, state);
      })
    );

    const quotePerPath = quotesPerPath.map((quotes, i) => {
      if (quotes === undefined) {
        const quoteRequest = quoteRequestsPerPath[i];
        if (quoteRequest === undefined) {
          return undefined;
        } else {
          throw new Error(
            `No quotes found for ${quoteRequest.fromToken.symbol} -> ${quoteRequest.toToken.symbol}`
          );
        }
      }

      // fetchQuotes is already sorted by toAmount
      return first(quotes);
    });

    const swapOutputPerPath = quotePerPath.map(quote => {
      if (quote === undefined) {
        return { token: input.token, amount: input.amount };
      }
      return { token: quote.toToken, amount: quote.toAmount };
    });

    const bridgeOutputPerPath = await Promise.all(
      swapOutputPerPath.map(async (output, i) => ({
        amount: await this.applyFees(paths[i], output.amount),
        token: paths[i].dest.token,
      }))
    );

    const possible = bridgeOutputPerPath
      .map((amount, i) => ({
        input: input,
        output: bridgeOutputPerPath[i],
        swap: quotePerPath[i]
          ? { input, output: swapOutputPerPath[i], quote: quotePerPath[i]! }
          : undefined,
        bridge: { input: swapOutputPerPath[i], output: bridgeOutputPerPath[i] },
        path: paths[i],
      }))
      .sort((a, b) => b.output.amount.comparedTo(a.output.amount));

    const best = possible[0];

    const steps: ZapQuoteStep[] = [];

    // Optional swap
    if (best.swap) {
      steps.push({
        type: 'swap',
        fromToken: best.swap.quote.fromToken,
        fromAmount: best.swap.quote.fromAmount,
        toToken: best.swap.quote.toToken,
        toAmount: best.swap.quote.toAmount,
        via: 'aggregator',
        providerId: best.swap.quote.providerId,
        fee: best.swap.quote.fee,
        quote: best.swap.quote,
      });
    }

    // Bridge
    const bridgeCost = await this.fetchBridgeCost(
      best.bridge.input.token,
      best.bridge.output.token,
      StargateZapType.Deposit
    );
    steps.push({
      type: 'bridge',
      from: best.bridge.input,
      to: best.bridge.output,
      providerId: 'stargate',
      fee: bridgeCost,
    });

    // Deposit
    steps.push({
      type: 'deposit',
      token: best.bridge.output.token,
      amount: best.bridge.output.amount,
    });

    const inputsWithCost = [input, { ...bridgeCost, max: false }];
    const outputs = [best.bridge.output];

    return {
      id: createQuoteId(option.id),
      strategyId: 'stargate-crosschain-single',
      priceImpact: calculatePriceImpact(inputsWithCost, outputs, [], state),
      option,
      inputs,
      outputs,
      returned: [],
      allowances,
      steps,
      fee: ZERO_FEE, // beefy fee
      path: best.path,
    };
  }

  async fetchDepositStep(
    quote: StargateCrossChainSingleDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const bridgeQuote = quote.steps.find(isZapQuoteStepBridge);
    const swapQuote = quote.steps.find(isZapQuoteStepSwap);
    if (!bridgeQuote) {
      throw new Error('Missing bridge step from quote');
    }

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);
      const minBalances = new Balances(quote.inputs);
      const direction: StargateZapType = StargateZapType.Deposit;
      const zapHelpers: ZapHelpers = {
        slippage,
        state,
        path: quote.path,
        direction,
      };
      const steps: ZapStep[] = [];

      // Swaps
      if (swapQuote) {
        const swapZap = await this.fetchZapSwap(swapQuote, zapHelpers, false);
        // add step to order
        swapZap.zaps.forEach(zap => steps.push(zap));
        // track minimum balances for use in further steps
        minBalances.subtractMany(swapZap.inputs);
        minBalances.addMany(swapZap.minOutputs);
      }

      // Bridge
      const bridgeCost = await this.fetchBridgeCost(
        bridgeQuote.from.token,
        bridgeQuote.to.token,
        direction
      );
      const bridgeZap = await this.fetchZapBridge(
        bridgeQuote,
        minBalances.get(bridgeQuote.from.token),
        zapHelpers,
        bridgeCost,
        StargateZapType.Deposit
      );
      bridgeZap.zaps.forEach(zap => steps.push(zap));

      // Build order
      const inputs: OrderInput[] = mergeTokenAmounts([bridgeCost], quote.inputs).map(input => ({
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      }));

      // Nothing is a required output on this side of the bridge
      const requiredOutputs: OrderOutput[] = [];

      // Return any unused tokens
      // Swap input is covered by quote input, swap output is covered by bridge input
      const dustOutputs: OrderOutput[] = [
        ...quote.inputs.map(i => ({ token: getTokenAddress(i.token), minOutputAmount: '0' })),
        {
          token: getTokenAddress(bridgeQuote.from.token),
          minOutputAmount: '0',
        },
        {
          token: getTokenAddress(bridgeCost.token),
          minOutputAmount: '0',
        },
      ];

      // @dev uniqBy: first occurrence of each element is kept.
      const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

      // Perform TX
      const zapRequest: UserlessZapRequest = {
        order: {
          inputs,
          outputs,
          relay: NO_RELAY,
        },
        steps,
      };

      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        [],
        quote.path.source.chainId
      );

      return walletAction(dispatch, getState, extraArgument);
    };

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: {
        zap: true,
        vaultId: quote.option.vaultId,
        stargate: { from: bridgeQuote.from.token, to: bridgeQuote.to.token },
      },
    };
  }

  async fetchWithdrawOptions(): Promise<StargateCrossChainSingleWithdrawOption[]> {
    const { vault, vaultType } = this.helpers;
    const tokens = await this.fetchWithdrawTokens();
    const inputs = [vaultType.depositToken];

    return tokens.map(token => {
      const outputs = [token];
      const selectionId = createSelectionId(token.chainId, outputs);

      return {
        id: createOptionId('stargate-crosschain-single', vault.id, selectionId),
        vaultId: vault.id,
        chainId: vault.chainId,
        selectionId,
        selectionChainId: token.chainId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: outputs,
        strategyId: 'stargate-crosschain-single',
        mode: TransactMode.Withdraw,
      };
    });
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: StargateCrossChainSingleWithdrawOption
  ): Promise<StargateCrossChainSingleWithdrawQuote> {
    const { vault, swapAggregator, getState } = this.helpers;
    if (!isStandardVault(vault)) {
      throw new Error('Vault is not standard');
    }

    // Input
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    // Output
    const wantedToken = onlyOneToken(option.wantedOutputs);
    const paths = this.paths.filter(
      p =>
        p.canWithdraw &&
        p.source.chainId === input.token.chainId &&
        p.dest.chainId === wantedToken.chainId &&
        p.dest.tokenAddress === wantedToken.address
    );
    if (!paths) {
      throw new Error(
        `No paths from ${input.token.chainId} to ${wantedToken.symbol} on ${wantedToken.chainId}`
      );
    }

    // Token Allowances
    const state = getState();
    const sourceZap = selectZapByChainId(state, input.token.chainId);
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, vault, state);
    const withdrawnAmountAfterFee = fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals);
    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: sourceZap.manager,
      },
    ];

    // Step 1. Withdraw from vault
    const steps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        token: withdrawnToken,
        amount: withdrawnAmountAfterFee,
      },
    ];

    // Step 2. [Swap +] Bridge
    const quoteRequestsPerPath: (QuoteRequest | undefined)[] = paths.map(path =>
      isTokenEqual(path.source.token, input.token)
        ? undefined
        : {
            vaultId: vault.id,
            fromToken: input.token,
            fromAmount: input.amount,
            toToken: path.source.token,
          }
    );

    const quotesPerPath = await Promise.all(
      quoteRequestsPerPath.map(async quoteRequest => {
        if (!quoteRequest) {
          return undefined;
        }

        return await swapAggregator.fetchQuotes(quoteRequest, state);
      })
    );

    const quotePerPath = quotesPerPath.map((quotes, i) => {
      if (quotes === undefined) {
        const quoteRequest = quoteRequestsPerPath[i];
        if (quoteRequest === undefined) {
          return undefined;
        } else {
          throw new Error(
            `No quotes found for ${quoteRequest.fromToken.symbol} -> ${quoteRequest.toToken.symbol}`
          );
        }
      }

      // fetchQuotes is already sorted by toAmount
      return first(quotes);
    });

    const swapOutputPerPath = quotePerPath.map(quote => {
      if (quote === undefined) {
        return { token: input.token, amount: input.amount };
      }
      return { token: quote.toToken, amount: quote.toAmount };
    });

    const bridgeOutputPerPath = await Promise.all(
      swapOutputPerPath.map(async (output, i) => ({
        amount: await this.applyFees(paths[i], output.amount),
        token: paths[i].dest.token,
      }))
    );

    const possible = bridgeOutputPerPath
      .map((amount, i) => ({
        input: input,
        output: bridgeOutputPerPath[i],
        swap: quotePerPath[i]
          ? { input, output: swapOutputPerPath[i], quote: quotePerPath[i]! }
          : undefined,
        bridge: { input: swapOutputPerPath[i], output: bridgeOutputPerPath[i] },
        path: paths[i],
      }))
      .sort((a, b) => b.output.amount.comparedTo(a.output.amount));

    const best = possible[0];

    // Optional swap
    if (best.swap) {
      steps.push({
        type: 'swap',
        fromToken: best.swap.quote.fromToken,
        fromAmount: best.swap.quote.fromAmount,
        toToken: best.swap.quote.toToken,
        toAmount: best.swap.quote.toAmount,
        via: 'aggregator',
        providerId: best.swap.quote.providerId,
        fee: best.swap.quote.fee,
        quote: best.swap.quote,
      });
    }

    // Bridge
    const bridgeCost = await this.fetchBridgeCost(
      best.bridge.input.token,
      best.bridge.output.token,
      StargateZapType.Withdraw
    );
    steps.push({
      type: 'bridge',
      from: best.bridge.input,
      to: best.bridge.output,
      providerId: 'stargate',
      fee: bridgeCost,
    });

    const inputsWithCost = [input, { ...bridgeCost, max: false }];
    const outputs = [best.bridge.output];

    return {
      id: createQuoteId(option.id),
      strategyId: 'stargate-crosschain-single',
      priceImpact: calculatePriceImpact(inputsWithCost, outputs, [], state),
      option,
      inputs,
      outputs,
      returned: [],
      allowances,
      steps,
      fee: ZERO_FEE, // beefy fee
      path: best.path,
    };
  }

  async fetchWithdrawStep(
    quote: StargateCrossChainSingleWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { vaultType } = this.helpers;
    const bridgeQuote = quote.steps.find(isZapQuoteStepBridge);
    const swapQuote = quote.steps.find(isZapQuoteStepSwap);
    const withdrawQuote = quote.steps.find(isZapQuoteStepWithdraw);
    if (!withdrawQuote) {
      throw new Error('Missing withdraw step from quote');
    }
    if (!bridgeQuote) {
      throw new Error('Missing bridge step from quote');
    }

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);
      const minBalances = new Balances(quote.inputs);
      const direction: StargateZapType = StargateZapType.Withdraw;
      const zapHelpers: ZapHelpers = {
        slippage,
        state,
        path: quote.path,
        direction,
      };
      const steps: ZapStep[] = [];

      // Step 1. Withdraw from vault
      const vaultWithdraw = await vaultType.fetchZapWithdraw({
        inputs: quote.inputs,
      });
      const withdrawOutput = first(vaultWithdraw.outputs);
      if (!withdrawOutput || vaultWithdraw.outputs.length !== 1) {
        throw new Error('Withdraw output count mismatch');
      }
      if (withdrawOutput.amount.lt(withdrawQuote.toAmount)) {
        throw new Error('Withdraw output amount mismatch');
      }
      steps.push(vaultWithdraw.zap);

      // Step 2. Optional Swap
      if (swapQuote) {
        const swapZap = await this.fetchZapSwap(swapQuote, zapHelpers, false);
        // add step to order
        swapZap.zaps.forEach(zap => steps.push(zap));
        // track minimum balances for use in further steps
        minBalances.subtractMany(swapZap.inputs);
        minBalances.addMany(swapZap.minOutputs);
      }

      // Step 3. Bridge
      const bridgeCost = await this.fetchBridgeCost(
        bridgeQuote.from.token,
        bridgeQuote.to.token,
        direction
      );
      const bridgeZap = await this.fetchZapBridge(
        bridgeQuote,
        minBalances.get(bridgeQuote.from.token),
        zapHelpers,
        bridgeCost,
        StargateZapType.Withdraw
      );
      bridgeZap.zaps.forEach(zap => steps.push(zap));

      // Build order (note: input to order is shares, but quote inputs are the deposit token)
      const inputs: OrderInput[] = mergeTokenAmounts([bridgeCost], vaultWithdraw.inputs).map(
        input => ({
          token: getTokenAddress(input.token),
          amount: toWeiString(input.amount, input.token.decimals),
        })
      );

      // Nothing is a required output on this side of the bridge
      const requiredOutputs: OrderOutput[] = [];

      // Return any unused tokens
      // Swap input is covered by quote input, swap output is covered by bridge input
      const dustOutputs: OrderOutput[] = [
        ...quote.inputs.map(i => ({ token: getTokenAddress(i.token), minOutputAmount: '0' })),
        {
          token: getTokenAddress(bridgeQuote.from.token),
          minOutputAmount: '0',
        },
        {
          token: getTokenAddress(bridgeCost.token),
          minOutputAmount: '0',
        },
      ];

      // @dev uniqBy: first occurrence of each element is kept.
      const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

      // Perform TX
      const zapRequest: UserlessZapRequest = {
        order: {
          inputs,
          outputs,
          relay: NO_RELAY,
        },
        steps,
      };

      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        [],
        quote.path.source.chainId
      );

      return walletAction(dispatch, getState, extraArgument);
    };

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: {
        zap: true,
        vaultId: quote.option.vaultId,
        stargate: { from: bridgeQuote.from.token, to: bridgeQuote.to.token },
      },
    };
  }

  protected selectPaths(state: BeefyState): StargatePath[] {
    return stargatePaths
      .map(path => {
        const source = stargatePools.get(path.source);
        if (!source) {
          return undefined;
        }

        const dest = stargatePools.get(path.dest);
        if (!dest) {
          return undefined;
        }

        const sourceToken = selectTokenByAddressOrUndefined(
          state,
          source.chainId,
          source.tokenAddress
        );
        if (!sourceToken) {
          return undefined;
        }

        const destToken = selectTokenByAddressOrUndefined(state, dest.chainId, dest.tokenAddress);
        if (!destToken) {
          return undefined;
        }

        return {
          canDeposit:
            this.canSendZapFromChain(state, source.chainId) &&
            this.canReceiveZapDepositToChain(dest.chainId),
          canWithdraw:
            this.canSendZapFromChain(state, source.chainId) &&
            this.canReceiveZapWithdrawToChain(dest.chainId),
          source: {
            ...source,
            token: sourceToken,
            zap: selectZapByChainId(state, source.chainId),
          },
          dest: {
            ...dest,
            token: destToken,
            zap: selectZapByChainId(state, dest.chainId),
          },
        };
      })
      .filter(isDefined);
  }

  protected toNative(state: BeefyState, token: TokenEntity): TokenEntity {
    const wnative = selectChainWrappedNativeToken(state, token.chainId);
    const native = selectChainNativeToken(state, token.chainId);
    return wnativeToNative(token, wnative, native);
  }

  protected async fetchDepositTokens() {
    // Find any token we can swap to a token that can be bridged and deposited in the vault
    const { getState, vault, vaultType, swapAggregator } = this.helpers;
    const state = getState();
    const depositToken = vaultType.depositToken;
    const stargateToken = this.toNative(state, depositToken);

    const directPaths = this.paths.filter(
      p =>
        p.canDeposit &&
        p.dest.token.address === stargateToken.address &&
        p.dest.token.chainId === stargateToken.chainId &&
        p.source.token.chainId !== stargateToken.chainId
    );

    const tokens = uniqueTokens(directPaths.map(p => p.source.token));
    const tokensByChainId = groupBy(tokens, t => t.chainId) as Record<
      ChainEntity['id'],
      TokenEntity[]
    >;
    const supportPerChain = await Promise.all(
      entries(tokensByChainId).map(async ([chainId, tokens]) =>
        swapAggregator.fetchTokenSupport(tokens, vault.id, chainId, state, this.options.swap)
      )
    );

    return uniqueTokens([...tokens, ...supportPerChain.map(s => s.any).flat()]);
  }

  protected async fetchWithdrawTokens() {
    // Find any token we can swap the deposit token for that can also be bridged to another chain
    const { getState, vault, vaultType, swapAggregator } = this.helpers;
    const state = getState();
    // What can we swap the deposit token for
    const swapSupport = await swapAggregator.fetchTokenSupport(
      [vaultType.depositToken],
      vault.id,
      vault.chainId,
      state,
      this.options.swap
    );

    // Which path can accept one of those tokens
    const possiblePaths = this.paths.filter(
      p =>
        p.canWithdraw &&
        p.source.token.chainId === vault.chainId &&
        p.dest.token.chainId !== vault.chainId &&
        (isTokenEqual(vaultType.depositToken, p.source.token) ||
          swapSupport.any.some(s => isTokenEqual(s, p.source.token)))
    );

    return uniqueTokens(possiblePaths.map(p => p.dest.token).flat());
  }

  protected getStargateConfig(chainId: ChainEntity['id']) {
    const config = stargateConfigs[chainId];
    if (!config) {
      throw new Error(`No stargate config found for chain id ${chainId}`);
    }
    return config;
  }

  protected getStargateChainId(chainId: ChainEntity['id']) {
    const config = this.getStargateConfig(chainId);
    return config.chainId;
  }

  protected canReceiveZapDepositToChain(chainId: ChainEntity['id']) {
    return stargateConfigs[chainId]?.zapReceiverAddress !== undefined;
  }

  protected canReceiveZapWithdrawToChain(chainId: ChainEntity['id']) {
    return stargateConfigs[chainId]?.composerAddress !== undefined;
  }

  protected canSendZapFromChain(state: BeefyState, chainId: ChainEntity['id']) {
    return (
      stargateConfigs[chainId]?.composerAddress !== undefined &&
      selectZapByChainIdOrUndefined(state, chainId) !== undefined
    );
  }

  /**
   * Returns estimate of the amount that will be received after fees
   * Assumes 1:1 source:dest token before fees
   */
  protected async applyFees(path: StargatePath, amount: BigNumber) {
    const { getState } = this.helpers;
    const state = getState();
    const amountWei = toWei(amount, path.source.token.decimals);
    const amountSD = amountWei.dividedToIntegerBy(path.source.convertRate);
    const chain = selectChainById(state, path.source.chainId);
    const web3 = await getWeb3Instance(chain);
    const contract = new web3.eth.Contract(
      viemToWeb3Abi(StargateFeeLibraryAbi),
      path.source.feeLibraryAddress
    );
    const destChainId = this.getStargateChainId(path.dest.chainId);
    if (!destChainId) {
      throw new Error(`No stargate chain id found for chain id ${path.dest.chainId}`);
    }
    const fees: LibraryGetFeesResult = await contract.methods
      .getFees(
        path.source.poolId,
        path.dest.poolId,
        destChainId.toString(),
        ZERO_ADDRESS,
        amountSD.toString(10)
      )
      .call();

    const eqFee = new BigNumber(fees[LibraryGetFeesResultKey.eqFee]);
    const eqReward = new BigNumber(fees[LibraryGetFeesResultKey.eqReward]);
    const lpFee = new BigNumber(fees[LibraryGetFeesResultKey.lpFee]);
    const protocolFee = new BigNumber(fees[LibraryGetFeesResultKey.protocolFee]);
    // const lkbRemoveFee = new BigNumber(fees[LibraryGetFeesResultKey.lkbRemoveFee]);

    const feeSourceSD = eqFee.plus(protocolFee).plus(lpFee).minus(eqReward);
    const feeSource = fromWei(
      feeSourceSD.multipliedBy(path.source.convertRate),
      path.source.token.decimals
    );

    // Assumes 1:1 source:dest token
    return amount.minus(feeSource);
  }

  protected makeDepositPayload(vaultAddress: string, tokenAddress: string, userAddress: string) {
    if (tokenAddress === 'native') {
      tokenAddress = ZERO_ADDRESS;
    }

    return abiCoder.encodeParameters(
      ['address', 'address', 'address'],
      [vaultAddress, tokenAddress, userAddress]
    );
  }

  protected async fetchBridgeCost(
    fromToken: TokenEntity,
    toToken: TokenEntity,
    type: StargateZapType
  ): Promise<TokenAmount> {
    const { vault, getState } = this.helpers;
    const state = getState();
    const fromChain = selectChainById(state, fromToken.chainId);
    const fromStargateConfig = this.getStargateConfig(fromChain.id);
    const toChain = selectChainById(state, toToken.chainId);
    const toStargateConfig = this.getStargateConfig(toChain.id);
    if (!toStargateConfig.composerAddress) {
      throw new Error(`No stargate composer address found for chain id ${toChain.id}`);
    }
    const receiverAddress =
      type === StargateZapType.Deposit ? toStargateConfig.zapReceiverAddress : ZERO_ADDRESS;
    if (!receiverAddress) {
      throw new Error(`No zap receiver address found for chain id ${toChain.id}`);
    }

    const web3 = await getWeb3Instance(fromChain);
    const contract = new web3.eth.Contract(
      viemToWeb3Abi(StargateComposerAbi),
      fromStargateConfig.composerAddress
    );
    const lzTxObj = [
      type === StargateZapType.Deposit ? toStargateConfig.depositGasLimit : '0', // dstGasForCall
      '0', // dstNativeAmount
      '0x', // dstNativeAddr (bytes)
    ];
    const payload =
      type === StargateZapType.Deposit
        ? this.makeDepositPayload(vault.earnContractAddress, toToken.address, receiverAddress)
        : '0x';
    const { 0: gasCost }: { 0: string; 1: string } = await contract.methods
      .quoteLayerZeroFee(
        toStargateConfig.chainId, // _chainId (destination)
        1, // _functionType (TYPE_SWAP_REMOTE)
        receiverAddress, // _toAddress
        payload, // _transferAndCallPayload
        lzTxObj // _lzTxParams
      )
      .call();
    const native = selectChainNativeToken(state, fromToken.chainId);

    return { token: native, amount: fromWeiString(gasCost, native.decimals) };
  }

  protected async fetchZapSwap(
    quoteStep: ZapQuoteStepSwap,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    if (isZapQuoteStepSwapAggregator(quoteStep)) {
      return this.fetchZapSwapAggregator(quoteStep, zapHelpers, insertBalance);
    } else {
      throw new Error('Unknown zap quote swap step type');
    }
  }

  protected async fetchZapSwapAggregator(
    quoteStep: ZapQuoteStepSwapAggregator,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    const { swapAggregator } = this.helpers;
    const { slippage, state, path } = zapHelpers;

    return await fetchZapAggregatorSwap(
      {
        quote: quoteStep.quote,
        inputs: [{ token: quoteStep.fromToken, amount: quoteStep.fromAmount }],
        outputs: [{ token: quoteStep.toToken, amount: quoteStep.toAmount }],
        maxSlippage: slippage,
        zapRouter: path.source.zap.router,
        providerId: quoteStep.providerId,
        insertBalance,
      },
      swapAggregator,
      state
    );
  }

  protected async fetchZapBridge(
    quoteStep: ZapQuoteStepBridge,
    minInputAmount: BigNumber,
    zapHelpers: ZapHelpers,
    bridgeCost: TokenAmount,
    direction: StargateZapType
  ): Promise<ZapStepResponse> {
    const { vault } = this.helpers;
    const { state, path, slippage } = zapHelpers;
    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      throw new Error('No wallet address found');
    }

    const input: TokenAmount = { token: quoteStep.from.token, amount: minInputAmount };
    const minLocal: TokenAmount = {
      token: quoteStep.from.token,
      amount: slipBy(minInputAmount, slippage, quoteStep.from.token.decimals),
    };
    const output: TokenAmount = { token: quoteStep.to.token, amount: quoteStep.to.amount };
    const minOutput: TokenAmount = {
      token: quoteStep.to.token,
      amount: slipBy(quoteStep.to.amount, slippage, quoteStep.to.token.decimals),
    };
    const fromStargateConfig = this.getStargateConfig(quoteStep.from.token.chainId);
    const toStargateConfig = this.getStargateConfig(quoteStep.to.token.chainId);
    const receiverAddress =
      direction === StargateZapType.Deposit ? toStargateConfig.zapReceiverAddress : userAddress;
    if (!receiverAddress) {
      throw new Error(`No zap receiver address found for chain id ${quoteStep.to.token.chainId}`);
    }

    const value = toWeiString(
      bridgeCost.amount.plus(
        isTokenEqual(quoteStep.from.token, bridgeCost.token) ? minInputAmount : BIG_ZERO
      ),
      bridgeCost.token.decimals
    );
    const lzTxObj = [
      direction === StargateZapType.Deposit ? toStargateConfig.depositGasLimit : '0', // dstGasForCall
      '0', // dstNativeAmount
      '0x', // dstNativeAddr (bytes)
    ];

    const abi = viemToWeb3Abi(StargateComposerAbi).find(
      f => f.type === 'function' && f.name === 'swap'
    );
    if (!abi) {
      throw new Error('No swap abi found');
    }

    const payload =
      direction === StargateZapType.Deposit
        ? this.makeDepositPayload(vault.earnContractAddress, vault.depositTokenAddress, userAddress)
        : '0x';
    const data = abiCoder.encodeFunctionCall(abi, [
      toStargateConfig.chainId, // _dstChainId
      path.source.poolId, // _srcPoolId
      path.dest.poolId, // _dstPoolId
      userAddress, // _refundAddress
      toWeiString(input.amount, input.token.decimals), // _amountLD
      toWeiString(minLocal.amount, minLocal.token.decimals), // _minAmountLD
      lzTxObj, // _lzTxParams
      receiverAddress, // _to
      payload, // _payload
    ]);

    // Fee is in native, so we can't insert into the order tokens if bridging from native
    return {
      inputs: [input],
      outputs: [output],
      minOutputs: [minOutput],
      returned: [],
      zaps: [
        {
          target: fromStargateConfig.composerAddress,
          value,
          data,
          tokens: isTokenErc20(input.token)
            ? [
                {
                  token: getTokenAddress(input.token),
                  index: getInsertIndex(4), // 0:dstChainId,1:srcPoolId,2:dstPoolId,3:refundAddress,4:amountLD
                },
              ]
            : [],
        },
      ],
    };
  }
}
