import type { Namespace, TFunction } from 'react-i18next';
import type { Address } from 'viem';
import { uniqBy } from 'lodash-es';
import { BIG_ZERO, toWeiBigInt, toWeiString } from '../../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity, TokenErc20 } from '../../../../entities/token.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { selectTokenByAddress } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectWalletAddress } from '../../../../selectors/wallet.ts';
import { selectZapByChainId } from '../../../../selectors/zap.ts';
import {
  buildBurnZapStep,
  buildBurnZapStepSimple,
  computeMaxFee,
  fetchBridgeQuote,
  getChainConfig,
  getSupportedChainIds,
  getUSDCForChain,
  isChainSupported,
  buildHookData,
} from '../../cctp/CCTPProvider.ts';
import type { ZapPayload } from '../../cctp/types.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
} from '../../helpers/options.ts';
import { pickTokens, uniqueTokens } from '../../helpers/tokens.ts';
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import {
  type CrossChainDepositOption,
  type CrossChainDepositQuote,
  type CrossChainWithdrawOption,
  type CrossChainWithdrawQuote,
  type DepositOption,
  type InputTokenAmount,
  isZapQuote,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  SelectionOrder,
  type TokenAmount,
  type WithdrawOption,
  type ZapQuoteStep,
  type ZapQuoteStepBridge,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types.ts';
import { fetchZapAggregatorSwap } from '../../zap/swap.ts';
import type { UserlessZapRequest, ZapStep, OrderOutput } from '../../zap/types.ts';
import type {
  IComposableStrategy,
  IStrategy,
  IZapStrategy,
  IZapStrategyStatic,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { CrossChainStrategyConfig } from '../strategy-configs.ts';
import { getTransactApi } from '../../../../apis/instances.ts';
import { crossChainZapExecuteOrder } from '../../../../actions/wallet/cross-chain.ts';

const strategyId = 'cross-chain';
type StrategyId = typeof strategyId;

class CrossChainStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  constructor(
    protected options: CrossChainStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {}

  // ---------------------------------------------------------------------------
  // DEPOSIT
  // ---------------------------------------------------------------------------

  async fetchDepositOptions(): Promise<CrossChainDepositOption[]> {
    const { vault, swapAggregator, getState } = this.helpers;
    const state = getState();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const options: CrossChainDepositOption[] = [];

    const supportedChainIds = this.options.supportedSourceChains ?? getSupportedChainIds();
    await Promise.allSettled(
      supportedChainIds.map(async sourceChainId => {
        if (sourceChainId === vault.chainId) return;
        if (!isChainSupported(sourceChainId)) return;

        const sourceUSDC = getUSDCForChain(sourceChainId, state);
        const destUSDC = getUSDCForChain(vault.chainId, state);
        const tokenSupport = await swapAggregator.fetchTokenSupport(
          [sourceUSDC],
          vault.id,
          sourceChainId,
          state,
          this.options.swap
        );

        for (const token of tokenSupport.any) {
          const selectionId = createSelectionId(sourceChainId, [token], 'cross-chain');
          options.push({
            id: createOptionId('cross-chain', vault.id, selectionId),
            strategyId: 'cross-chain',
            mode: TransactMode.Deposit,
            vaultId: vault.id,
            chainId: vault.chainId,
            sourceChainId,
            destChainId: vault.chainId,
            selectionId,
            selectionOrder: SelectionOrder.CrossChain,
            inputs: [token],
            wantedOutputs: [depositToken],
            bridgeToken: sourceUSDC,
            destBridgeToken: destUSDC,
            async: true,
          });
        }
      })
    );

    return options;
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CrossChainDepositOption
  ): Promise<CrossChainDepositQuote> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const input = onlyOneInput(inputs);
    const { sourceChainId, destChainId, bridgeToken, destBridgeToken } = option;

    // A. Source swap: input → USDC on source chain
    const sourceSteps: ZapQuoteStep[] = [];
    let usdcAmount = input.amount;

    if (input.token.address.toLowerCase() !== bridgeToken.address.toLowerCase()) {
      const quotes = await swapAggregator.fetchQuotes(
        {
          fromToken: input.token,
          fromAmount: input.amount,
          toToken: bridgeToken,
          vaultId: option.vaultId,
        },
        state,
        this.options.swap
      );
      if (!quotes.length) {
        throw new Error('No swap quotes available for source chain swap');
      }
      const bestSwap = quotes[0];
      usdcAmount = bestSwap.toAmount;
      sourceSteps.push({
        type: 'swap',
        via: 'aggregator',
        providerId: bestSwap.providerId,
        fee: bestSwap.fee,
        quote: bestSwap,
        fromToken: input.token,
        fromAmount: input.amount,
        toToken: bridgeToken,
        toAmount: bestSwap.toAmount,
      } satisfies ZapQuoteStepSwapAggregator);
    }

    // B. CCTP bridge quote
    const bridgeQuote = fetchBridgeQuote(
      sourceChainId,
      destChainId,
      usdcAmount,
      bridgeToken as TokenErc20,
      destBridgeToken as TokenErc20
    );

    sourceSteps.push({
      type: 'bridge',
      bridgeId: 'cctp',
      fromChainId: sourceChainId,
      toChainId: destChainId,
      fromToken: bridgeToken,
      toToken: destBridgeToken,
      fromAmount: bridgeQuote.fromAmount,
      toAmount: bridgeQuote.toAmount,
      timeEstimate: bridgeQuote.timeEstimate,
    } satisfies ZapQuoteStepBridge);

    // C. Destination strategy: find one that accepts destUSDC and quote it
    const destHelpers = await (
      await getTransactApi()
    ).getHelpersForChain(destChainId, option.vaultId, getState);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);
    const destMatch = await this.findDestStrategyForDeposit(destStrategies, destBridgeToken);
    if (!destMatch) {
      throw new Error(
        `No composable destination strategy accepts USDC on chain ${destChainId} for vault ${option.vaultId}`
      );
    }

    const destQuote = await destMatch.strategy.fetchDepositQuote(
      [{ token: destBridgeToken, amount: bridgeQuote.toAmount, max: false }],
      destMatch.option
    );

    const destSteps: ZapQuoteStep[] = isZapQuote(destQuote) ? destQuote.steps : [];

    // D. Build combined quote
    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }

    return {
      id: createQuoteId(option.id),
      strategyId: 'cross-chain',
      option,
      inputs,
      outputs: destQuote.outputs,
      returned: destQuote.returned,
      allowances:
        input.amount.gt(BIG_ZERO) ?
          [
            {
              token: input.token as TokenErc20,
              amount: input.amount,
              spenderAddress: sourceZap.router,
            },
          ]
        : [],
      priceImpact: calculatePriceImpact(inputs, destQuote.outputs, destQuote.returned, state),
      fee: highestFeeOrZero([...sourceSteps, ...destSteps]),
      steps: [...sourceSteps, ...destSteps],
      sourceSteps,
      destSteps,
      destQuote,
      bridgeQuote,
    };
  }

  async fetchDepositStep(quote: CrossChainDepositQuote, t: TFunction<Namespace>): Promise<Step> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const { sourceChainId, destChainId, bridgeToken } = quote.option;
    const slippage = selectTransactSlippage(state);

    console.debug('[CrossChain] fetchDepositStep - Starting', {
      sourceChainId,
      destChainId,
      vaultId: quote.option.vaultId,
      bridgeToken: bridgeToken.symbol,
      inputs: quote.inputs.map(i => ({ token: i.token.symbol, amount: i.amount.toString(10) })),
      slippage,
    });

    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      throw new Error('No wallet connected');
    }

    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }

    // 1. Re-load destination strategy and get composable breakdown
    const destHelpers = await (
      await getTransactApi()
    ).getHelpersForChain(destChainId, quote.option.vaultId, getState);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);
    const destStrategy = destStrategies.find(s => s.id === quote.destQuote.option.strategyId);
    if (!destStrategy || !isComposableStrategy(destStrategy)) {
      throw new Error(
        `Destination strategy '${quote.destQuote.option.strategyId}' on chain ${destChainId} is not composable`
      );
    }
    if (!isZapQuote(quote.destQuote)) {
      throw new Error('Destination quote is not a zap quote');
    }

    const breakdown = await destStrategy.fetchDepositUserlessZapBreakdown(
      quote.destQuote as Parameters<typeof destStrategy.fetchDepositUserlessZapBreakdown>[0]
    );

    console.debug('[CrossChain] Destination strategy breakdown', {
      strategyId: quote.destQuote.option.strategyId,
      steps: breakdown.zapRequest.steps.length,
      outputs: breakdown.zapRequest.order.outputs.length,
      expectedTokens: breakdown.expectedTokens.length,
      zapRequestSteps: breakdown.zapRequest.steps,
      zapRequestOutputs: breakdown.zapRequest.order.outputs,
    });

    // 2. Build ZapPayload for CircleBeefyZapReceiver on dest chain
    // Required outputs: from destination strategy (already have slippage)
    const requiredOutputs: OrderOutput[] = breakdown.zapRequest.order.outputs;

    // Dust outputs: collect all intermediate tokens
    const intermediateTokens = collectIntermediateTokens({
      context: 'deposit-dest',
      pickTokensFrom: {
        outputs: quote.destQuote.outputs,
        inputs: quote.destQuote.inputs,
        returned: isZapQuote(quote.destQuote) ? quote.destQuote.returned : [],
      },
      bridgeToken: quote.option.destBridgeToken,
      swapSteps: quote.destSteps,
      zapSteps: breakdown.zapRequest.steps,
      state,
      chainId: destChainId,
    });
    const dustOutputs = buildDustOutputs(intermediateTokens);

    // Merge: required first (correct slippage), then dust
    const outputs = mergeOutputs(requiredOutputs, dustOutputs);

    const zapPayload: ZapPayload = {
      recipient: userAddress,
      outputs,
      relay: NO_RELAY,
      route: breakdown.zapRequest.steps,
    };
    const hookData = buildHookData(destChainId, zapPayload);

    console.debug('[CrossChain] ZapPayload and hookData', {
      zapPayload,
      hookDataLength: hookData.length,
      hookData,
    });

    // 3. Build source chain ZapSteps
    const sourceZapSteps: ZapStep[] = [];
    const minBalances = new Balances(quote.inputs);

    // Source swap (if needed)
    const sourceSwapStep = quote.sourceSteps.find(isZapQuoteStepSwap);
    if (sourceSwapStep && isZapQuoteStepSwapAggregator(sourceSwapStep)) {
      console.debug('[CrossChain] Building source swap step', {
        fromToken: sourceSwapStep.fromToken.symbol,
        fromAmount: sourceSwapStep.fromAmount.toString(10),
        toToken: sourceSwapStep.toToken.symbol,
        toAmount: sourceSwapStep.toAmount.toString(10),
        providerId: sourceSwapStep.providerId,
      });

      const swapZap = await fetchZapAggregatorSwap(
        {
          quote: sourceSwapStep.quote,
          inputs: [{ token: sourceSwapStep.fromToken, amount: sourceSwapStep.fromAmount }],
          outputs: [{ token: sourceSwapStep.toToken, amount: sourceSwapStep.toAmount }],
          maxSlippage: slippage,
          zapRouter: sourceZap.router,
          providerId: sourceSwapStep.providerId,
          insertBalance: true,
        },
        swapAggregator,
        state
      );
      swapZap.zaps.forEach(step => sourceZapSteps.push(step));
      minBalances.subtractMany(swapZap.inputs);
      minBalances.addMany(swapZap.minOutputs);

      console.debug('[CrossChain] Source swap ZapSteps built', {
        steps: swapZap.zaps.length,
        minOutputs: swapZap.minOutputs.map(o => ({
          token: o.token.symbol,
          amount: o.amount.toString(10),
        })),
      });
    } else {
      console.debug('[CrossChain] No source swap needed');
    }

    // CCTP burn step
    const sourceConfig = getChainConfig(sourceChainId);
    const destConfig = getChainConfig(destChainId);
    const usdcBalance = minBalances.get(bridgeToken);
    const maxFee =
      sourceConfig.fastFeeBps !== undefined ?
        toWeiBigInt(computeMaxFee(usdcBalance, sourceConfig.fastFeeBps), bridgeToken.decimals)
      : 0n;

    console.debug('[CrossChain] Building CCTP burn step', {
      usdcBalance: usdcBalance.toString(10),
      maxFee: maxFee.toString(),
      sourceTokenMessenger: sourceConfig.tokenMessenger,
      destReceiver: destConfig.receiver,
      destDomain: destConfig.domain,
      fastFeeBps: sourceConfig.fastFeeBps,
    });

    const burnStep = buildBurnZapStep(
      sourceChainId,
      destChainId,
      bridgeToken.address,
      destConfig.receiver as Address,
      maxFee,
      hookData
    );
    sourceZapSteps.push(burnStep);

    console.debug('[CrossChain] CCTP burn step built', {
      target: burnStep.target,
      value: burnStep.value,
      dataLength: burnStep.data.length,
      tokens: burnStep.tokens.map(t => ({ token: t.token, index: t.index })),
    });

    // 4. Build UserlessZapRequest (source chain)
    // Build dust outputs for source chain (no required outputs - USDC is burned)
    const sourceSwapStepOrUndefined =
      sourceSwapStep && isZapQuoteStepSwapAggregator(sourceSwapStep) ? sourceSwapStep : undefined;

    const sourceIntermediateTokens = collectIntermediateTokens({
      context: 'deposit-source',
      inputs: quote.inputs,
      bridgeToken: quote.option.bridgeToken,
      swapStep: sourceSwapStepOrUndefined,
      zapSteps: sourceZapSteps,
      state,
      chainId: sourceChainId,
    });
    const sourceOutputs = buildDustOutputs(sourceIntermediateTokens);

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: quote.inputs.map(i => ({
          token: getTokenAddress(i.token),
          amount: toWeiString(i.amount, i.token.decimals),
        })),
        outputs: sourceOutputs,
        relay: NO_RELAY,
      },
      steps: sourceZapSteps,
    };

    console.debug('[CrossChain] Final source zapRequest', {
      orderInputs: zapRequest.order.inputs,
      orderOutputs: zapRequest.order.outputs,
      totalSteps: zapRequest.steps.length,
      steps: zapRequest.steps.map((s, i) => ({
        index: i,
        target: s.target,
        value: s.value,
        dataLength: s.data.length,
        tokens: s.tokens,
      })),
    });

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: crossChainZapExecuteOrder(
        sourceChainId,
        quote.option.vaultId,
        zapRequest,
        breakdown.expectedTokens
      ),
      pending: false,
      extraInfo: {
        zap: true,
        vaultId: quote.option.vaultId,
        crossChain: { sourceChainId, destChainId },
      },
    };
  }

  // ---------------------------------------------------------------------------
  // WITHDRAW
  // ---------------------------------------------------------------------------

  async fetchWithdrawOptions(): Promise<CrossChainWithdrawOption[]> {
    const { vault, swapAggregator, getState } = this.helpers;
    const state = getState();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const options: CrossChainWithdrawOption[] = [];

    if (!isChainSupported(vault.chainId)) return [];

    const sourceUSDC = getUSDCForChain(vault.chainId, state);
    const supportedDestChains = this.options.supportedDestChains ?? getSupportedChainIds();

    await Promise.allSettled(
      supportedDestChains.map(async destChainId => {
        if (destChainId === vault.chainId) return;
        if (!isChainSupported(destChainId)) return;

        const destUSDC = getUSDCForChain(destChainId, state);

        // Path A: USDC output (no hooks)
        const usdcSelectionId = createSelectionId(destChainId, [destUSDC], 'cross-chain-withdraw');
        options.push({
          id: createOptionId('cross-chain', vault.id, usdcSelectionId),
          strategyId: 'cross-chain',
          mode: TransactMode.Withdraw,
          vaultId: vault.id,
          chainId: vault.chainId,
          sourceChainId: vault.chainId,
          destChainId,
          selectionId: usdcSelectionId,
          selectionOrder: SelectionOrder.CrossChain,
          inputs: [depositToken],
          wantedOutputs: [destUSDC],
          bridgeToken: sourceUSDC,
          destBridgeToken: destUSDC,
          needsDestHook: false,
          async: true,
        });

        // Path B: Non-USDC outputs (with hooks for dest swap)
        const destTokenSupport = await swapAggregator.fetchTokenSupport(
          [destUSDC],
          vault.id,
          destChainId,
          state,
          this.options.swap
        );

        for (const token of destTokenSupport.any) {
          if (token.address.toLowerCase() === destUSDC.address.toLowerCase()) continue;

          const selectionId = createSelectionId(destChainId, [token], 'cross-chain-withdraw');
          options.push({
            id: createOptionId('cross-chain', vault.id, selectionId),
            strategyId: 'cross-chain',
            mode: TransactMode.Withdraw,
            vaultId: vault.id,
            chainId: vault.chainId,
            sourceChainId: vault.chainId,
            destChainId,
            selectionId,
            selectionOrder: SelectionOrder.CrossChain,
            inputs: [depositToken],
            wantedOutputs: [token],
            bridgeToken: sourceUSDC,
            destBridgeToken: destUSDC,
            needsDestHook: true,
            async: true,
          });
        }
      })
    );

    return options;
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: CrossChainWithdrawOption
  ): Promise<CrossChainWithdrawQuote> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const { sourceChainId, destChainId, bridgeToken, destBridgeToken, needsDestHook } = option;

    // A. Find vault strategy that can withdraw to USDC
    const vaultStrategies = await (await getTransactApi()).getZapStrategiesForVault(this.helpers);
    const withdrawMatch = await this.findVaultStrategyForUSDCWithdraw(vaultStrategies, bridgeToken);
    if (!withdrawMatch) {
      throw new Error(
        `No composable vault strategy can withdraw to USDC on chain ${sourceChainId} for vault ${option.vaultId}`
      );
    }

    // B. Quote withdrawal to USDC on vault chain
    const sourceWithdrawQuote = await withdrawMatch.strategy.fetchWithdrawQuote(
      inputs,
      withdrawMatch.option
    );

    // Sum USDC output from withdrawal
    const usdcOutput = sourceWithdrawQuote.outputs.find(
      o => o.token.address.toLowerCase() === bridgeToken.address.toLowerCase()
    );
    if (!usdcOutput || usdcOutput.amount.lte(BIG_ZERO)) {
      throw new Error('Withdrawal did not produce USDC');
    }

    // C. CCTP bridge
    const bridgeQuote = fetchBridgeQuote(
      sourceChainId,
      destChainId,
      usdcOutput.amount,
      bridgeToken as TokenErc20,
      destBridgeToken as TokenErc20
    );

    const sourceSteps: ZapQuoteStep[] =
      isZapQuote(sourceWithdrawQuote) ? [...sourceWithdrawQuote.steps] : [];

    sourceSteps.push({
      type: 'bridge',
      bridgeId: 'cctp',
      fromChainId: sourceChainId,
      toChainId: destChainId,
      fromToken: bridgeToken,
      toToken: destBridgeToken,
      fromAmount: bridgeQuote.fromAmount,
      toAmount: bridgeQuote.toAmount,
      timeEstimate: bridgeQuote.timeEstimate,
    } satisfies ZapQuoteStepBridge);

    // D. Destination swap (Path B only)
    let destSteps: ZapQuoteStep[] = [];
    let finalOutputs: TokenAmount[];

    if (needsDestHook) {
      const desiredToken = option.wantedOutputs[0];
      const destSwapQuotes = await swapAggregator.fetchQuotes(
        {
          fromToken: destBridgeToken,
          fromAmount: bridgeQuote.toAmount,
          toToken: desiredToken,
          vaultId: option.vaultId,
        },
        state,
        this.options.swap
      );
      if (!destSwapQuotes.length) {
        throw new Error('No swap quotes available for destination chain swap');
      }
      const bestDestSwap = destSwapQuotes[0];
      destSteps = [
        {
          type: 'swap',
          via: 'aggregator',
          providerId: bestDestSwap.providerId,
          fee: bestDestSwap.fee,
          quote: bestDestSwap,
          fromToken: destBridgeToken,
          fromAmount: bridgeQuote.toAmount,
          toToken: desiredToken,
          toAmount: bestDestSwap.toAmount,
        } satisfies ZapQuoteStepSwapAggregator,
      ];
      finalOutputs = [{ token: desiredToken, amount: bestDestSwap.toAmount }];
    } else {
      finalOutputs = [{ token: destBridgeToken, amount: bridgeQuote.toAmount }];
    }

    // E. Build combined quote
    return {
      id: createQuoteId(option.id),
      strategyId: 'cross-chain',
      option,
      inputs,
      outputs: finalOutputs,
      returned: [],
      allowances: sourceWithdrawQuote.allowances,
      priceImpact: calculatePriceImpact(inputs, finalOutputs, [], state),
      fee: highestFeeOrZero([...sourceSteps, ...destSteps]),
      steps: [...sourceSteps, ...destSteps],
      sourceSteps,
      destSteps,
      sourceWithdrawQuote,
      bridgeQuote,
    };
  }

  async fetchWithdrawStep(quote: CrossChainWithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const { sourceChainId, destChainId, bridgeToken, destBridgeToken, needsDestHook } =
      quote.option;
    const slippage = selectTransactSlippage(state);

    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      throw new Error('No wallet connected');
    }

    // 1. Re-load source withdraw strategy
    const vaultStrategies = await (await getTransactApi()).getZapStrategiesForVault(this.helpers);
    const sourceStrategy = vaultStrategies.find(
      s => s.id === quote.sourceWithdrawQuote.option.strategyId
    );
    if (!sourceStrategy || !isComposableStrategy(sourceStrategy)) {
      throw new Error(
        `Source withdraw strategy '${quote.sourceWithdrawQuote.option.strategyId}' on chain ${sourceChainId} is not composable`
      );
    }

    const breakdown = await sourceStrategy.fetchWithdrawUserlessZapBreakdown(
      quote.sourceWithdrawQuote as Parameters<
        typeof sourceStrategy.fetchWithdrawUserlessZapBreakdown
      >[0]
    );

    // 2. Build source chain ZapSteps: withdrawal steps + CCTP burn
    const sourceZapSteps: ZapStep[] = [...breakdown.zapRequest.steps];

    const sourceConfig = getChainConfig(sourceChainId);
    const destConfig = getChainConfig(destChainId);
    const maxFee =
      sourceConfig.fastFeeBps !== undefined ?
        toWeiBigInt(
          computeMaxFee(quote.bridgeQuote.fromAmount, sourceConfig.fastFeeBps),
          bridgeToken.decimals
        )
      : 0n;

    if (needsDestHook) {
      // Path B: Non-USDC output → burn with hooks (dest swap via CircleBeefyZapReceiver)
      const destSwapStep = quote.destSteps.find(isZapQuoteStepSwap);
      if (!destSwapStep || !isZapQuoteStepSwapAggregator(destSwapStep)) {
        throw new Error('Expected aggregator swap step for destination chain');
      }

      const destZap = selectZapByChainId(state, destChainId);
      if (!destZap) {
        throw new Error(`No zap router on destination chain ${destChainId}`);
      }

      const wantedOutput = quote.option.wantedOutputs[0];
      const destSwapZap = await fetchZapAggregatorSwap(
        {
          quote: destSwapStep.quote,
          inputs: [{ token: destBridgeToken, amount: quote.bridgeQuote.toAmount }],
          outputs: [{ token: wantedOutput, amount: destSwapStep.toAmount }],
          maxSlippage: slippage,
          zapRouter: destZap.router,
          providerId: destSwapStep.providerId,
          insertBalance: true,
        },
        swapAggregator,
        state
      );

      // Required output: wanted token with double slippage
      const requiredOutputs: OrderOutput[] = [
        {
          token: getTokenAddress(wantedOutput),
          // Double slippage is intentional: minOutputs already includes aggregator slippage,
          // but the destination swap executes minutes later (after CCTP bridge), so we apply
          // additional slippage as safety margin for quote staleness.
          minOutputAmount: toWeiString(
            slipBy(destSwapZap.minOutputs[0].amount, slippage, wantedOutput.decimals),
            wantedOutput.decimals
          ),
        },
      ];

      // Dust outputs: collect all intermediate tokens
      const withdrawDestIntermediateTokens = collectIntermediateTokens({
        context: 'withdraw-dest',
        bridgeToken: quote.option.destBridgeToken,
        swapSteps: quote.destSteps,
        zapSteps: destSwapZap.zaps,
        state,
        chainId: destChainId,
      });
      const dustOutputs = buildDustOutputs(withdrawDestIntermediateTokens);

      // Merge: required first, then dust
      const outputs = mergeOutputs(requiredOutputs, dustOutputs);

      const zapPayload: ZapPayload = {
        recipient: userAddress,
        outputs,
        relay: NO_RELAY,
        route: destSwapZap.zaps,
      };

      const hookData = buildHookData(destChainId, zapPayload);
      const burnStep = buildBurnZapStep(
        sourceChainId,
        destChainId,
        bridgeToken.address,
        destConfig.receiver as Address,
        maxFee,
        hookData
      );
      sourceZapSteps.push(burnStep);
    } else {
      // Path A: USDC output → simple burn (user is mintRecipient, no hooks)
      const burnStep = buildBurnZapStepSimple(
        sourceChainId,
        destChainId,
        bridgeToken.address,
        userAddress as Address,
        maxFee
      );
      sourceZapSteps.push(burnStep);
    }

    // 3. Build UserlessZapRequest (vault chain)
    // Build dust outputs for source chain (withdraw flow)
    const withdrawQuoteConfig: WithdrawSourceConfig['withdrawQuote'] =
      isZapQuote(quote.sourceWithdrawQuote) ?
        {
          isZapQuote: true,
          outputs: quote.sourceWithdrawQuote.outputs,
          inputs: quote.sourceWithdrawQuote.inputs,
          returned: quote.sourceWithdrawQuote.returned,
          steps: quote.sourceWithdrawQuote.steps,
        }
      : { isZapQuote: false };

    const withdrawSourceIntermediateTokens = collectIntermediateTokens({
      context: 'withdraw-source',
      inputs: quote.inputs,
      bridgeToken: quote.option.bridgeToken,
      withdrawQuote: withdrawQuoteConfig,
      zapSteps: sourceZapSteps,
      state,
      chainId: sourceChainId,
    });
    const sourceOutputs = buildDustOutputs(withdrawSourceIntermediateTokens);

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: quote.inputs.map(i => ({
          token: getTokenAddress(i.token),
          amount: toWeiString(i.amount, i.token.decimals),
        })),
        outputs: sourceOutputs,
        relay: NO_RELAY,
      },
      steps: sourceZapSteps,
    };

    // Withdrawals execute on vault's chain but are cross-chain ops (USDC bridged to dest)
    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: crossChainZapExecuteOrder(sourceChainId, quote.option.vaultId, zapRequest, []),
      pending: false,
      extraInfo: {
        zap: true,
        vaultId: quote.option.vaultId,
        crossChain: { sourceChainId, destChainId },
      },
    };
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  private async findDestStrategyForDeposit(
    strategies: IStrategy[],
    destUSDC: TokenErc20 | { address: string }
  ): Promise<{ strategy: IStrategy; option: DepositOption } | undefined> {
    for (const strategy of strategies) {
      try {
        const options = await strategy.fetchDepositOptions();
        const usdcOption = options.find(
          o =>
            o.inputs.length === 1 &&
            o.inputs[0].address.toLowerCase() === destUSDC.address.toLowerCase()
        );
        if (usdcOption && isComposableStrategy(strategy)) {
          return { strategy, option: usdcOption };
        }
      } catch {
        continue;
      }
    }
    return undefined;
  }

  private async findVaultStrategyForUSDCWithdraw(
    strategies: IStrategy[],
    sourceUSDC: TokenErc20 | { address: string }
  ): Promise<{ strategy: IStrategy; option: WithdrawOption } | undefined> {
    for (const strategy of strategies) {
      try {
        const options = await strategy.fetchWithdrawOptions();
        const usdcOption = options.find(o =>
          o.wantedOutputs.some(t => t.address.toLowerCase() === sourceUSDC.address.toLowerCase())
        );
        if (usdcOption && isComposableStrategy(strategy)) {
          return { strategy, option: usdcOption };
        }
      } catch {
        continue;
      }
    }
    return undefined;
  }
}

function isComposableStrategy(strategy: IStrategy): strategy is IComposableStrategy {
  return (
    'fetchDepositUserlessZapBreakdown' in strategy &&
    'fetchWithdrawUserlessZapBreakdown' in strategy
  );
}

// ===== Dust Output Helper Types and Functions =====

/**
 * Configuration for deposit destination dust outputs.
 * Used when building ZapPayload for CircleBeefyZapReceiver on dest chain.
 */
type DepositDestConfig = {
  context: 'deposit-dest';
  pickTokensFrom: {
    outputs: TokenAmount[];
    inputs: InputTokenAmount[];
    returned: TokenAmount[];
  };
  bridgeToken: TokenEntity;
  swapSteps: ZapQuoteStep[];
  zapSteps: ZapStep[];
  state: BeefyState;
  chainId: ChainEntity['id'];
};

/**
 * Configuration for deposit source dust outputs.
 * Used when building UserlessZapRequest for source chain (USDC burn case).
 */
type DepositSourceConfig = {
  context: 'deposit-source';
  inputs: InputTokenAmount[];
  bridgeToken: TokenEntity;
  swapStep?: ZapQuoteStepSwapAggregator;
  zapSteps: ZapStep[];
  state: BeefyState;
  chainId: ChainEntity['id'];
};

/**
 * Configuration for withdraw destination dust outputs.
 * Used when building ZapPayload for destination swap (non-USDC output).
 */
type WithdrawDestConfig = {
  context: 'withdraw-dest';
  bridgeToken: TokenEntity;
  swapSteps: ZapQuoteStep[];
  zapSteps: ZapStep[];
  state: BeefyState;
  chainId: ChainEntity['id'];
};

/**
 * Configuration for withdraw source dust outputs.
 * Used when building UserlessZapRequest for vault chain (withdrawal flow).
 */
type WithdrawSourceConfig = {
  context: 'withdraw-source';
  inputs: InputTokenAmount[];
  bridgeToken: TokenEntity;
  withdrawQuote:
    | {
        isZapQuote: true;
        outputs: TokenAmount[];
        inputs: InputTokenAmount[];
        returned: TokenAmount[];
        steps: ZapQuoteStep[];
      }
    | { isZapQuote: false };
  zapSteps: ZapStep[];
  state: BeefyState;
  chainId: ChainEntity['id'];
};

/**
 * Discriminated union for all dust output building contexts.
 */
type IntermediateTokenConfig =
  | DepositDestConfig
  | DepositSourceConfig
  | WithdrawDestConfig
  | WithdrawSourceConfig;

/**
 * Collects all intermediate tokens that should be returned as dust outputs.
 * Uses discriminated union to handle different contexts type-safely.
 *
 * Each context has different token sources:
 * - deposit-dest: pickTokens + bridgeToken + swapSteps + zapSteps
 * - deposit-source: inputs + bridgeToken + optional swapStep + zapSteps
 * - withdraw-dest: bridgeToken + swapSteps + zapSteps
 * - withdraw-source: inputs + bridgeToken + optional withdrawQuote + zapSteps
 *
 * @param config - Configuration with context-specific token sources
 * @returns Array of unique TokenEntity objects (deduplicated by chainId + address)
 */
function collectIntermediateTokens(config: IntermediateTokenConfig): TokenEntity[] {
  const tokens: TokenEntity[] = [];

  switch (config.context) {
    case 'deposit-dest': {
      // pickTokens(outputs, inputs, returned)
      const pickedTokens = pickTokens(
        config.pickTokensFrom.outputs,
        config.pickTokensFrom.inputs,
        config.pickTokensFrom.returned
      );
      tokens.push(...pickedTokens);

      // Bridge token (USDC arrives from bridge)
      tokens.push(config.bridgeToken);

      // Swap step tokens
      config.swapSteps.filter(isZapQuoteStepSwap).forEach(swapStep => {
        tokens.push(swapStep.fromToken);
        tokens.push(swapStep.toToken);
      });

      break;
    }

    case 'deposit-source': {
      // Input tokens (in case of partial consumption)
      tokens.push(...config.inputs.map(i => i.token));

      // Bridge token (USDC before burn)
      tokens.push(config.bridgeToken);

      // Swap step tokens (if present)
      if (config.swapStep) {
        tokens.push(config.swapStep.fromToken);
        tokens.push(config.swapStep.toToken);
      }

      break;
    }

    case 'withdraw-dest': {
      // Bridge token (USDC)
      tokens.push(config.bridgeToken);

      // Swap step tokens
      config.swapSteps.filter(isZapQuoteStepSwap).forEach(swapStep => {
        tokens.push(swapStep.fromToken);
        tokens.push(swapStep.toToken);
      });

      break;
    }

    case 'withdraw-source': {
      // Input tokens (mooToken)
      tokens.push(...config.inputs.map(i => i.token));

      // Bridge token (USDC before burn)
      tokens.push(config.bridgeToken);

      // Withdraw quote tokens (if it's a zap quote)
      if (config.withdrawQuote.isZapQuote) {
        const pickedTokens = pickTokens(
          config.withdrawQuote.outputs,
          config.withdrawQuote.inputs,
          config.withdrawQuote.returned
        );
        tokens.push(...pickedTokens);

        // Swap intermediates from withdraw steps
        config.withdrawQuote.steps.filter(isZapQuoteStepSwap).forEach(swapStep => {
          tokens.push(swapStep.fromToken);
          tokens.push(swapStep.toToken);
        });
      }

      break;
    }
  }

  // Return unique tokens (by chainId + address)
  return uniqueTokens(tokens);
}

/**
 * Converts token entities to dust outputs (minOutputAmount='0').
 * Deduplicates by token address.
 *
 * @param tokens - Array of token entities
 * @returns Array of OrderOutput with minOutputAmount='0'
 */
function buildDustOutputs(tokens: TokenEntity[]): OrderOutput[] {
  // Convert to OrderOutput with minOutputAmount='0'
  const outputs = tokens.map(token => ({
    token: getTokenAddress(token),
    minOutputAmount: '0',
  }));

  // Deduplicate by token address (uniqBy keeps first occurrence)
  return uniqBy(outputs, output => output.token);
}

/**
 * Merges required outputs and dust outputs, ensuring required outputs take precedence.
 * Deduplicates by token address, keeping the first occurrence (required outputs come first).
 *
 * @param required - Required outputs with proper slippage settings
 * @param dust - Dust outputs with minOutputAmount='0'
 * @returns Merged and deduplicated OrderOutput array
 */
function mergeOutputs(required: OrderOutput[], dust: OrderOutput[]): OrderOutput[] {
  // Concatenate required first, then dust
  // uniqBy keeps first occurrence, so required outputs take precedence
  return uniqBy(required.concat(dust), output => output.token);
}

export const CrossChainStrategy = CrossChainStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
