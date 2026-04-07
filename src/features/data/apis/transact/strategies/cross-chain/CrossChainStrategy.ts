import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { type Address, encodeFunctionData } from 'viem';
import { uniqBy } from 'lodash-es';
import { ERC20Abi } from '../../../../../../config/abi/ERC20Abi.ts';
import { BIG_ZERO, toWeiBigInt, toWeiString } from '../../../../../../helpers/big-number.ts';
import type { TokenEntity, TokenErc20 } from '../../../../entities/token.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import type { CrossChainRecoveryParams } from '../../../../reducers/wallet/transact-types.ts';
import type { CrossChainExecuteMetadata } from '../../../../actions/wallet/cross-chain.ts';
import { selectTokenByAddress } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectWalletAddress } from '../../../../selectors/wallet.ts';
import { selectZapByChainId } from '../../../../selectors/zap.ts';
import {
  buildBurnZapStep,
  buildBurnZapStepPassthrough,
  computeMaxFee,
  fetchBridgeQuote,
  getChainConfig,
  getSupportedChainIds,
  getUSDCForChain,
  isChainSupported,
  buildHookData,
} from '../../cctp/CCTPProvider.ts';
import type { ZapPayload } from '../../cctp/types.ts';
import { bridgeSlippageReturned, mergeTokenAmounts, slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
} from '../../helpers/options.ts';
import { pickTokens, uniqueTokens } from '../../helpers/tokens.ts';
import {
  calculatePriceImpact,
  highestFeeOrZero,
  totalValueOfTokenAmounts,
} from '../../helpers/quotes.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import {
  type AllowanceTokenAmount,
  type CrossChainDepositOption,
  type CrossChainDepositQuote,
  type CrossChainWithdrawOption,
  type CrossChainWithdrawQuote,
  type DepositOption,
  type InputTokenAmount,
  type RecoveryQuote,
  type SingleDepositOption,
  type SingleWithdrawOption,
  isZapQuote,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  SelectionOrder,
  type TokenAmount,
  type WithdrawOption,
  type ZapQuoteStep,
  type ZapQuoteStepBridge,
  type ZapQuoteStepSwapAggregator,
  type ZapQuoteStepUnused,
} from '../../transact-types.ts';
import { fetchZapAggregatorSwap } from '../../zap/swap.ts';
import type { UserlessZapRequest, ZapStep, OrderOutput } from '../../zap/types.ts';
import {
  type IStrategy,
  type IZapStrategy,
  type IZapStrategyStatic,
  type ZapTransactHelpers,
  isComposableStrategy,
} from '../IStrategy.ts';
import type { CrossChainStrategyConfig } from '../strategy-configs.ts';
import { getTransactApi } from '../../../instances.ts';
import {
  crossChainZapExecuteOrder,
  crossChainRecoveryExecuteOrder,
} from '../../../../actions/wallet/cross-chain.ts';

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
    const slippage = selectTransactSlippage(state);
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

    // B. CCTP bridge quote (slip only when there was a source swap; direct USDC input has no swap slippage)
    const bridgeUsdcAmount =
      sourceSteps.length > 0 ? slipBy(usdcAmount, slippage, bridgeToken.decimals) : usdcAmount;
    const bridgeQuote = fetchBridgeQuote(
      sourceChainId,
      destChainId,
      bridgeUsdcAmount,
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
    let destSteps: ZapQuoteStep[] = isZapQuote(destQuote) ? destQuote.steps : [];

    // D. Slippage buffer: all source USDC is bridged, excess arrives on dest as returned tokens
    const destSlippageReturn =
      sourceSteps.length > 0 ?
        bridgeSlippageReturned(usdcAmount, bridgeUsdcAmount, bridgeQuote, destBridgeToken)
      : undefined;
    if (destSlippageReturn) {
      destSteps = [
        ...destSteps,
        { type: 'unused', outputs: [destSlippageReturn] } satisfies ZapQuoteStepUnused,
      ];
    }
    const returned = mergeTokenAmounts(
      destSlippageReturn ? [destSlippageReturn] : [],
      destQuote.returned
    );

    // E. Build combined quote
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
      returned,
      allowances:
        input.amount.gt(BIG_ZERO) ?
          [
            {
              token: input.token as TokenErc20,
              amount: input.amount,
              spenderAddress: sourceZap.manager,
            },
          ]
        : [],
      priceImpact: calculatePriceImpact(
        inputs,
        destQuote.outputs,
        returned,
        state,
        totalValueOfTokenAmounts([{ token: bridgeQuote.fromToken, amount: bridgeQuote.fee }], state)
      ),
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
    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      throw new Error('No wallet connected');
    }

    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }

    // 1. Build source chain swap first (to get step-time USDC amount)
    const sourceZapSteps: ZapStep[] = [];
    const minBalances = new Balances(quote.inputs);

    const sourceSwapStep = quote.sourceSteps.find(isZapQuoteStepSwap);
    if (sourceSwapStep && isZapQuoteStepSwapAggregator(sourceSwapStep)) {
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
    }

    // 2. Compute step-time bridge quote from slippage-adjusted USDC balance
    const usdcBalance = minBalances.get(bridgeToken);
    const { destBridgeToken } = quote.option;
    const stepBridgeQuote = fetchBridgeQuote(
      sourceChainId,
      destChainId,
      usdcBalance,
      bridgeToken as TokenErc20,
      destBridgeToken as TokenErc20
    );

    // 3. Reuse stored destination quote (slippage already applied at quote time)
    const stepDestQuote = quote.destQuote;
    if (!isZapQuote(stepDestQuote)) {
      throw new Error('Destination quote is not a zap quote');
    }

    const destHelpers = await (
      await getTransactApi()
    ).getHelpersForChain(destChainId, quote.option.vaultId, getState);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);
    const destStrategy = destStrategies.find(s => s.id === stepDestQuote.option.strategyId);
    if (!destStrategy || !isComposableStrategy(destStrategy)) {
      throw new Error(
        `Destination strategy '${stepDestQuote.option.strategyId}' on chain ${destChainId} is not composable`
      );
    }

    const breakdown = await destStrategy.fetchDepositUserlessZapBreakdown(
      stepDestQuote as Parameters<typeof destStrategy.fetchDepositUserlessZapBreakdown>[0]
    );

    // 4. Build ZapPayload for CircleBeefyZapReceiver on dest chain
    const requiredOutputs: OrderOutput[] = breakdown.zapRequest.order.outputs;

    const intermediateTokens = collectIntermediateTokens({
      context: 'deposit-dest',
      pickTokensFrom: {
        outputs: stepDestQuote.outputs,
        inputs: stepDestQuote.inputs,
        returned: stepDestQuote.returned,
      },
      bridgeToken: destBridgeToken,
      swapSteps: stepDestQuote.steps,
    });
    const dustOutputs = buildDustOutputs(intermediateTokens);

    const outputs = mergeOutputs(requiredOutputs, dustOutputs);

    const zapPayload: ZapPayload = {
      recipient: userAddress,
      outputs,
      relay: NO_RELAY,
      route: breakdown.zapRequest.steps,
    };
    const {
      hookData,
      receiver,
      oversized: isTwoStep,
    } = buildHookData(sourceChainId, destChainId, zapPayload);

    // 5. Balance check: self-transfer to assert minimum USDC before burn
    sourceZapSteps.push(
      this.buildBalanceCheckZapStep(
        bridgeToken.address,
        sourceZap.router,
        toWeiString(usdcBalance, bridgeToken.decimals)
      )
    );

    // 6. CCTP burn step
    const sourceConfig = getChainConfig(sourceChainId);
    const maxFee =
      sourceConfig.fastFeeBps !== undefined ?
        toWeiBigInt(
          computeMaxFee(usdcBalance, sourceConfig.fastFeeBps, bridgeToken.decimals),
          bridgeToken.decimals
        )
      : 0n;

    if (isTwoStep) {
      // hookData exceeds CCTP message size limit: bridge USDC to user's wallet via passthrough,
      // then recovery flow handles the destination deposit
      const burnStep = buildBurnZapStepPassthrough(
        sourceChainId,
        destChainId,
        bridgeToken.address as Address,
        userAddress as Address,
        maxFee
      );
      sourceZapSteps.push(burnStep);
    } else {
      const burnStep = buildBurnZapStep(
        sourceChainId,
        destChainId,
        bridgeToken.address,
        receiver,
        maxFee,
        hookData
      );
      sourceZapSteps.push(burnStep);
    }

    // 6. Build UserlessZapRequest (source chain)
    // Build dust outputs for source chain (no required outputs - USDC is burned)
    const sourceSwapStepOrUndefined =
      sourceSwapStep && isZapQuoteStepSwapAggregator(sourceSwapStep) ? sourceSwapStep : undefined;

    const sourceIntermediateTokens = collectIntermediateTokens({
      context: 'deposit-source',
      inputs: quote.inputs,
      bridgeToken: quote.option.bridgeToken,
      swapStep: sourceSwapStepOrUndefined,
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

    const metadata = this.buildRecoveryMetadata(
      quote,
      { token: destBridgeToken, amount: stepBridgeQuote.toAmount },
      isTwoStep
    );

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: crossChainZapExecuteOrder(
        sourceChainId,
        quote.option.vaultId,
        zapRequest,
        breakdown.expectedTokens,
        metadata
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
    // C. CCTP bridge (use slippage-adjusted USDC so dest quote is pessimistic)
    const slippage = selectTransactSlippage(state);
    const slippedUsdcAmount = slipBy(usdcOutput.amount, slippage, bridgeToken.decimals);
    const bridgeQuote = fetchBridgeQuote(
      sourceChainId,
      destChainId,
      slippedUsdcAmount,
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

    // E. Slippage buffer: all source USDC is bridged, excess arrives on dest as returned tokens
    const destSlippageReturn = bridgeSlippageReturned(
      usdcOutput.amount,
      slippedUsdcAmount,
      bridgeQuote,
      destBridgeToken
    );
    if (destSlippageReturn) {
      destSteps = [
        ...destSteps,
        { type: 'unused', outputs: [destSlippageReturn] } satisfies ZapQuoteStepUnused,
      ];
    }
    const returned = mergeTokenAmounts(
      isZapQuote(sourceWithdrawQuote) ? sourceWithdrawQuote.returned : [],
      destSlippageReturn ? [destSlippageReturn] : []
    );

    // F. Build combined quote
    return {
      id: createQuoteId(option.id),
      strategyId: 'cross-chain',
      option,
      inputs,
      outputs: finalOutputs,
      returned,
      allowances: sourceWithdrawQuote.allowances,
      priceImpact: calculatePriceImpact(
        inputs,
        finalOutputs,
        returned,
        state,
        totalValueOfTokenAmounts([{ token: bridgeQuote.fromToken, amount: bridgeQuote.fee }], state)
      ),
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

    // 3. Compute step-time USDC from source withdrawal output (slippage-adjusted)
    const usdcOutput = quote.sourceWithdrawQuote.outputs.find(
      o => o.token.address.toLowerCase() === bridgeToken.address.toLowerCase()
    );
    if (!usdcOutput || usdcOutput.amount.lte(BIG_ZERO)) {
      throw new Error('Source withdrawal quote did not produce USDC');
    }
    const stepUsdcAmount = slipBy(usdcOutput.amount, slippage, bridgeToken.decimals);

    // Balance check: self-transfer to assert minimum USDC before burn
    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }
    sourceZapSteps.push(
      this.buildBalanceCheckZapStep(
        bridgeToken.address,
        sourceZap.router,
        toWeiString(stepUsdcAmount, bridgeToken.decimals)
      )
    );

    // 4. Step-time bridge quote from slippage-adjusted USDC
    const stepBridgeQuote = fetchBridgeQuote(
      sourceChainId,
      destChainId,
      stepUsdcAmount,
      bridgeToken as TokenErc20,
      destBridgeToken as TokenErc20
    );

    const maxFee =
      sourceConfig.fastFeeBps !== undefined ?
        toWeiBigInt(
          computeMaxFee(stepUsdcAmount, sourceConfig.fastFeeBps, bridgeToken.decimals),
          bridgeToken.decimals
        )
      : 0n;

    let isTwoStep = false;

    if (needsDestHook) {
      // Path B: Non-USDC output → burn with hooks (dest swap via CircleBeefyZapReceiver)
      const destZap = selectZapByChainId(state, destChainId);
      if (!destZap) {
        throw new Error(`No zap router on destination chain ${destChainId}`);
      }

      const wantedOutput = quote.option.wantedOutputs[0];

      // 5. Reuse stored dest swap step (slippage already applied at quote time)
      const destSwapStep = quote.destSteps
        .filter(isZapQuoteStepSwap)
        .find(isZapQuoteStepSwapAggregator);
      if (!destSwapStep) {
        throw new Error('Missing dest swap step for needsDestHook path');
      }

      const destSwapZap = await fetchZapAggregatorSwap(
        {
          quote: destSwapStep.quote,
          inputs: [{ token: destSwapStep.fromToken, amount: destSwapStep.fromAmount }],
          outputs: [{ token: destSwapStep.toToken, amount: destSwapStep.toAmount }],
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

      const { hookData, receiver, oversized } = buildHookData(
        sourceChainId,
        destChainId,
        zapPayload
      );
      if (oversized) {
        isTwoStep = true;
      }

      if (isTwoStep) {
        // hookData exceeds CCTP message size limit: bridge USDC to user's wallet via passthrough,
        // then recovery flow handles the destination swap
        const burnStep = buildBurnZapStepPassthrough(
          sourceChainId,
          destChainId,
          bridgeToken.address as Address,
          userAddress as Address,
          maxFee
        );
        sourceZapSteps.push(burnStep);
      } else {
        const burnStep = buildBurnZapStep(
          sourceChainId,
          destChainId,
          bridgeToken.address,
          receiver,
          maxFee,
          hookData
        );
        sourceZapSteps.push(burnStep);
      }
    } else {
      // Path A: USDC output → passthrough burn via hook (receiver collects fee, then forwards to user)
      const burnStep = buildBurnZapStepPassthrough(
        sourceChainId,
        destChainId,
        bridgeToken.address as Address,
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

    // Some strategies declare quote.inputs as the deposit token (e.g. SingleStrategy uses USDT),
    // while others use the vault share token (e.g. CowcentratedStrategy uses the mooToken).
    // For the withdraw flow, the actual input the user holds is always the vault share token (mooToken),
    // so we use breakdown.zapRequest.order.inputs which correctly contains the share token.
    // The deposit token is already covered by the withdrawQuote branch in collectIntermediateTokens.
    const withdrawInputTokens: InputTokenAmount[] = breakdown.zapRequest.order.inputs.map(oi => ({
      token: selectTokenByAddress(state, sourceChainId, oi.token),
      amount: BIG_ZERO,
      max: false,
    }));

    const withdrawSourceIntermediateTokens = collectIntermediateTokens({
      context: 'withdraw-source',
      inputs: withdrawInputTokens,
      bridgeToken: quote.option.bridgeToken,
      withdrawQuote: withdrawQuoteConfig,
    });
    const sourceOutputs = buildDustOutputs(withdrawSourceIntermediateTokens);

    // order.inputs must be the vault share token (mooToken) from the breakdown,
    // not quote.inputs (deposit token), because the Zap Router uses order.inputs
    // to transferFrom the user — and the user holds mooTokens, not the deposit token.
    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: breakdown.zapRequest.order.inputs,
        outputs: sourceOutputs,
        relay: NO_RELAY,
      },
      steps: sourceZapSteps,
    };

    // Withdrawals execute on vault's chain but are cross-chain ops (USDC bridged to dest)
    const metadata = this.buildRecoveryMetadata(
      quote,
      { token: destBridgeToken, amount: stepBridgeQuote.toAmount },
      isTwoStep
    );

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: crossChainZapExecuteOrder(
        sourceChainId,
        quote.option.vaultId,
        zapRequest,
        [],
        metadata
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
  // RECOVERY
  // ---------------------------------------------------------------------------

  /**
   * Build a ZapStep that does a self-transfer of USDC on the router.
   * Acts as a minimum balance assertion: if the router holds less than `minAmount`,
   * the ERC20 transfer reverts, failing the tx on the source chain rather than
   * letting an under-funded burn go through to the destination chain.
   */
  private buildBalanceCheckZapStep(
    usdcAddress: string,
    zapRouter: string,
    minAmount: string
  ): ZapStep {
    const data = encodeFunctionData({
      abi: ERC20Abi,
      functionName: 'transfer',
      args: [zapRouter as Address, BigInt(minAmount)],
    });

    return {
      target: usdcAddress,
      value: '0',
      data,
      tokens: [],
    };
  }

  private buildRecoveryMetadata(
    quote: CrossChainDepositQuote | CrossChainWithdrawQuote,
    bridgedAmount: { token: TokenEntity; amount: BigNumber },
    twoStep?: boolean
  ): CrossChainExecuteMetadata {
    const { sourceChainId, destChainId, vaultId } = quote.option;
    const direction = quote.option.mode === TransactMode.Deposit ? 'deposit' : 'withdraw';

    let recovery: CrossChainRecoveryParams;
    if (direction === 'deposit') {
      recovery = {
        direction: 'deposit',
        destChainId,
        vaultId,
        bridgeTokenAddress: bridgedAmount.token.address,
        bridgedAmount: bridgedAmount.amount.toString(10),
      };
    } else {
      const withdrawOption = (quote as CrossChainWithdrawQuote).option;
      recovery = {
        direction: 'withdraw',
        destChainId,
        vaultId,
        bridgeTokenAddress: bridgedAmount.token.address,
        bridgedAmount: bridgedAmount.amount.toString(10),
        desiredOutputAddress:
          withdrawOption.needsDestHook ? withdrawOption.wantedOutputs[0].address : undefined,
      };
    }

    return {
      opId: `xchain-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      direction,
      sourceChainId,
      destChainId,
      vaultId,
      sourceInput: { token: quote.inputs[0].token, amount: quote.inputs[0].amount },
      expectedOutput: { token: quote.outputs[0].token, amount: quote.outputs[0].amount },
      sourceDisplaySteps: quote.sourceSteps,
      destDisplaySteps: quote.destSteps,
      recovery,
      twoStep,
    };
  }

  /**
   * Quote the destination-only deposit for recovery display.
   * Resolves dest strategy, gets a fresh quote, returns a RecoveryQuote for UI.
   */
  async fetchDestinationDepositQuote(params: {
    destChainId: ChainEntity['id'];
    vaultId: VaultEntity['id'];
    bridgedAmount: BigNumber;
    bridgeToken: TokenErc20;
  }): Promise<RecoveryQuote> {
    const { getState } = this.helpers;
    const state = getState();
    const { destChainId, vaultId, bridgedAmount, bridgeToken } = params;

    const destHelpers = await (
      await getTransactApi()
    ).getHelpersForChain(destChainId, vaultId, getState);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);

    const destMatch = await this.findDestStrategyForDeposit(destStrategies, bridgeToken);
    if (!destMatch) {
      throw new Error(
        `No composable destination strategy accepts USDC on ${destChainId} for vault ${vaultId}`
      );
    }

    const destQuote = await destMatch.strategy.fetchDepositQuote(
      [{ token: bridgeToken, amount: bridgedAmount, max: false }],
      destMatch.option
    );
    if (!isZapQuote(destQuote)) {
      throw new Error('Destination quote is not a zap quote');
    }

    const allowances: AllowanceTokenAmount[] = destQuote.allowances.filter(a =>
      a.amount.gt(BIG_ZERO)
    );

    return {
      id: createQuoteId(destQuote.option.id),
      inputs: destQuote.inputs,
      outputs: destQuote.outputs,
      returned: destQuote.returned,
      steps: destQuote.steps,
      priceImpact: calculatePriceImpact(
        destQuote.inputs,
        destQuote.outputs,
        destQuote.returned,
        state
      ),
      fee: highestFeeOrZero(destQuote.steps),
      allowances,
    };
  }

  /**
   * Build a destination-only deposit step for recovery execution.
   * Re-quotes internally at step-time for fresh data.
   */
  async fetchDestinationDepositStep(
    params: {
      opId: string;
      destChainId: ChainEntity['id'];
      vaultId: VaultEntity['id'];
      bridgedAmount: BigNumber;
      bridgeToken: TokenErc20;
    },
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { getState } = this.helpers;
    const state = getState();
    const { opId, destChainId, vaultId, bridgedAmount, bridgeToken } = params;

    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      throw new Error('No wallet connected');
    }

    // 1. Resolve dest helpers and strategies
    const destHelpers = await (
      await getTransactApi()
    ).getHelpersForChain(destChainId, vaultId, getState);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);

    // 2. Find composable dest strategy that accepts USDC
    const destMatch = await this.findDestStrategyForDeposit(destStrategies, bridgeToken);
    if (!destMatch) {
      throw new Error(
        `No composable destination strategy accepts USDC on ${destChainId} for vault ${vaultId}`
      );
    }

    // 3. Fresh deposit quote with actual bridged USDC amount
    const stepDestQuote = await destMatch.strategy.fetchDepositQuote(
      [{ token: bridgeToken, amount: bridgedAmount, max: false }],
      destMatch.option
    );
    if (!isZapQuote(stepDestQuote)) {
      throw new Error('Destination quote is not a zap quote');
    }
    if (!isComposableStrategy(destMatch.strategy)) {
      throw new Error(`Destination strategy '${destMatch.strategy.id}' is not composable`);
    }

    // 4. Get userless ZapSteps for dest
    const breakdown = await destMatch.strategy.fetchDepositUserlessZapBreakdown(
      stepDestQuote as Parameters<typeof destMatch.strategy.fetchDepositUserlessZapBreakdown>[0]
    );

    // 5. Build UserlessZapRequest for dest chain execution
    const destZap = selectZapByChainId(state, destChainId);
    if (!destZap) {
      throw new Error(`No zap router on chain ${destChainId}`);
    }

    const intermediateTokens = collectIntermediateTokens({
      context: 'deposit-dest',
      pickTokensFrom: {
        outputs: stepDestQuote.outputs,
        inputs: stepDestQuote.inputs,
        returned: stepDestQuote.returned,
      },
      bridgeToken,
      swapSteps: stepDestQuote.steps,
    });
    const dustOutputs = buildDustOutputs(intermediateTokens);
    const outputs = mergeOutputs(breakdown.zapRequest.order.outputs, dustOutputs);

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: [
          {
            token: getTokenAddress(bridgeToken),
            amount: toWeiString(bridgedAmount, bridgeToken.decimals),
          },
        ],
        outputs,
        relay: NO_RELAY,
      },
      steps: breakdown.zapRequest.steps,
    };

    // 6. Return Step executing on dest chain
    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: crossChainRecoveryExecuteOrder(
        opId,
        destChainId,
        vaultId,
        zapRequest,
        breakdown.expectedTokens
      ),
      pending: false,
      extraInfo: { zap: true, vaultId },
    };
  }

  /**
   * Quote the destination-only withdraw swap for recovery display.
   * Given USDC on dest chain, quote swapping it to the desired output token.
   */
  async fetchDestinationWithdrawQuote(params: {
    destChainId: ChainEntity['id'];
    vaultId: VaultEntity['id'];
    bridgedAmount: BigNumber;
    bridgeToken: TokenErc20;
    desiredOutput: TokenEntity;
  }): Promise<RecoveryQuote> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const { vaultId, bridgedAmount, bridgeToken, desiredOutput } = params;

    const destSwapQuotes = await swapAggregator.fetchQuotes(
      {
        fromToken: bridgeToken,
        fromAmount: bridgedAmount,
        toToken: desiredOutput,
        vaultId,
      },
      state,
      this.options.swap
    );
    if (!destSwapQuotes.length) {
      throw new Error('No swap quotes available for recovery');
    }
    const bestSwap = destSwapQuotes[0];

    const swapStep: ZapQuoteStepSwapAggregator = {
      type: 'swap',
      via: 'aggregator',
      providerId: bestSwap.providerId,
      fromToken: bridgeToken,
      toToken: desiredOutput,
      fromAmount: bridgedAmount,
      toAmount: bestSwap.toAmount,
      fee: bestSwap.fee,
      quote: bestSwap,
    };

    const inputs: InputTokenAmount[] = [{ token: bridgeToken, amount: bridgedAmount, max: false }];
    const outputs: TokenAmount[] = [{ token: desiredOutput, amount: bestSwap.toAmount }];

    return {
      id: createQuoteId(`recovery-withdraw-${vaultId}`),
      inputs,
      outputs,
      returned: [],
      steps: [swapStep],
      priceImpact: calculatePriceImpact(inputs, outputs, [], state),
      fee: highestFeeOrZero([swapStep]),
      allowances: [],
    };
  }

  /**
   * Build a destination-only withdraw step for recovery execution.
   * Re-quotes the swap internally at step-time for fresh data.
   */
  async fetchDestinationWithdrawStep(
    params: {
      opId: string;
      destChainId: ChainEntity['id'];
      vaultId: VaultEntity['id'];
      bridgedAmount: BigNumber;
      bridgeToken: TokenErc20;
      desiredOutput: TokenEntity;
    },
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const { opId, destChainId, vaultId, bridgedAmount, bridgeToken, desiredOutput } = params;
    const slippage = selectTransactSlippage(state);

    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      throw new Error('No wallet connected');
    }

    // 1. Get fresh swap quote: USDC → desired token on dest chain
    const destSwapQuotes = await swapAggregator.fetchQuotes(
      {
        fromToken: bridgeToken,
        fromAmount: bridgedAmount,
        toToken: desiredOutput,
        vaultId,
      },
      state,
      this.options.swap
    );
    if (!destSwapQuotes.length) {
      throw new Error('No swap quotes available for recovery');
    }
    const bestSwap = destSwapQuotes[0];

    const destZap = selectZapByChainId(state, destChainId);
    if (!destZap) {
      throw new Error(`No zap router on chain ${destChainId}`);
    }

    // 2. Build ZapSteps for the swap
    const swapZap = await fetchZapAggregatorSwap(
      {
        quote: bestSwap,
        inputs: [{ token: bridgeToken, amount: bridgedAmount }],
        outputs: [{ token: desiredOutput, amount: bestSwap.toAmount }],
        maxSlippage: slippage,
        zapRouter: destZap.router,
        providerId: bestSwap.providerId,
        insertBalance: true,
      },
      swapAggregator,
      state
    );

    // 3. Build outputs with slippage
    const minOutput = slipBy(swapZap.minOutputs[0].amount, slippage, desiredOutput.decimals);
    const requiredOutputs: OrderOutput[] = [
      {
        token: getTokenAddress(desiredOutput),
        minOutputAmount: toWeiString(minOutput, desiredOutput.decimals),
      },
    ];

    const intermediateTokens = collectIntermediateTokens({
      context: 'withdraw-dest',
      bridgeToken,
      swapSteps: [
        {
          type: 'swap' as const,
          via: 'aggregator' as const,
          providerId: bestSwap.providerId,
          fromToken: bridgeToken,
          toToken: desiredOutput,
          fromAmount: bridgedAmount,
          toAmount: bestSwap.toAmount,
          fee: bestSwap.fee,
          quote: bestSwap,
        },
      ],
    });
    const dustOutputs = buildDustOutputs(intermediateTokens);
    const allOutputs = mergeOutputs(requiredOutputs, dustOutputs);

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: [
          {
            token: getTokenAddress(bridgeToken),
            amount: toWeiString(bridgedAmount, bridgeToken.decimals),
          },
        ],
        outputs: allOutputs,
        relay: NO_RELAY,
      },
      steps: swapZap.zaps,
    };

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: crossChainRecoveryExecuteOrder(opId, destChainId, vaultId, zapRequest, [
        desiredOutput,
      ]),
      pending: false,
      extraInfo: { zap: true, vaultId },
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
      } catch (err) {
        console.warn(
          `[cross-chain] findDestStrategyForDeposit: strategy '${strategy.id}' failed`,
          err
        );
      }
    }
    // Fallback: bridge token IS the vault's deposit token → direct deposit (no swap needed)
    const state = this.helpers.getState();
    const { vault } = this.helpers;
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (depositToken.address.toLowerCase() === destUSDC.address.toLowerCase()) {
      for (const strategy of strategies) {
        if (strategy.id === 'single' && isComposableStrategy(strategy)) {
          const selectionId = createSelectionId(vault.chainId, [depositToken]);
          const syntheticOption = {
            id: createOptionId(strategy.id, vault.id, selectionId, 'direct'),
            vaultId: vault.id,
            chainId: vault.chainId,
            selectionId,
            selectionOrder: SelectionOrder.Other,
            inputs: [depositToken],
            wantedOutputs: [depositToken],
            strategyId: strategy.id,
            mode: TransactMode.Deposit,
          } as SingleDepositOption;
          return { strategy, option: syntheticOption as DepositOption };
        }
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
        const usdcOption = options.find(
          o =>
            o.wantedOutputs.length === 1 &&
            o.wantedOutputs[0].address.toLowerCase() === sourceUSDC.address.toLowerCase()
        );
        if (usdcOption && isComposableStrategy(strategy)) {
          return { strategy, option: usdcOption };
        }
      } catch (err) {
        console.warn(
          `[cross-chain] findVaultStrategyForUSDCWithdraw: strategy '${strategy.id}' failed`,
          err
        );
      }
    }

    // Fallback: source USDC IS the vault's deposit token → direct withdraw (no swap needed)
    const state = this.helpers.getState();
    const { vault } = this.helpers;
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (depositToken.address.toLowerCase() === sourceUSDC.address.toLowerCase()) {
      for (const strategy of strategies) {
        if (strategy.id === 'single' && isComposableStrategy(strategy)) {
          const selectionId = createSelectionId(vault.chainId, [depositToken]);
          const syntheticOption = {
            id: createOptionId(strategy.id, vault.id, selectionId, 'direct'),
            vaultId: vault.id,
            chainId: vault.chainId,
            selectionId,
            selectionOrder: SelectionOrder.Other,
            inputs: [depositToken],
            wantedOutputs: [depositToken],
            strategyId: strategy.id,
            mode: TransactMode.Withdraw,
          } as SingleWithdrawOption;
          return { strategy, option: syntheticOption as WithdrawOption };
        }
      }
    }

    return undefined;
  }
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
};

/**
 * Configuration for withdraw destination dust outputs.
 * Used when building ZapPayload for destination swap (non-USDC output).
 */
type WithdrawDestConfig = {
  context: 'withdraw-dest';
  bridgeToken: TokenEntity;
  swapSteps: ZapQuoteStep[];
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
