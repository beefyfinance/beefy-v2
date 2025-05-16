import BigNumber from 'bignumber.js';
import { first, uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
  fromWei,
  toWei,
  toWeiString,
} from '../../../../../helpers/big-number.ts';
import { tokenInList } from '../../../../../helpers/tokens.ts';
import { zapExecuteOrder } from '../../../actions/wallet/zap.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenEntity, TokenErc20, TokenNative } from '../../../entities/token.ts';
import { isTokenEqual, isTokenErc20, isTokenNative } from '../../../entities/token.ts';
import { isStandardVault, type VaultStandard } from '../../../entities/vault.ts';
import { type AmmEntityUniswapLike, isUniswapLikeAmm } from '../../../entities/zap.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenById,
} from '../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../selectors/transact.ts';
import { selectAmmById } from '../../../selectors/zap.ts';
import type { BeefyState, BeefyThunk } from '../../../store/types.ts';
import { getUniswapLikePool } from '../../amm/amm.ts';
import type { IUniswapLikePool } from '../../amm/types.ts';
import { slipBy, tokenAmountToWei } from '../helpers/amounts.ts';
import { Balances } from '../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyAssetCount,
  onlyOneInput,
  onlyOneToken,
} from '../helpers/options.ts';
import { calculatePriceImpact, highestFeeOrZero, ZERO_FEE } from '../helpers/quotes.ts';
import {
  allTokensAreDistinct,
  includeWrappedAndNative,
  nativeAndWrappedAreSame,
  pickTokens,
  tokensToLp,
} from '../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../helpers/vault.ts';
import { getTokenAddress, NO_RELAY } from '../helpers/zap.ts';
import type { QuoteRequest } from '../swap/ISwapProvider.ts';
import {
  type InputTokenAmount,
  isZapQuoteStepBuild,
  isZapQuoteStepSplit,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepSwapPool,
  isZapQuoteStepWithdraw,
  SelectionOrder,
  type TokenAmount,
  type UniswapLikeDepositOption,
  type UniswapLikeDepositQuote,
  type UniswapLikeWithdrawOption,
  type UniswapLikeWithdrawQuote,
  type ZapFee,
  type ZapQuoteStep,
  type ZapQuoteStepBuild,
  type ZapQuoteStepSplit,
  type ZapQuoteStepSwap,
  type ZapQuoteStepSwapAggregator,
  type ZapQuoteStepSwapPool,
} from '../transact-types.ts';
import { isStandardVaultType, type IStandardVaultType } from '../vaults/IVaultType.ts';
import { fetchZapAggregatorSwap } from '../zap/swap.ts';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepResponse,
} from '../zap/types.ts';
import { QuoteChangedError } from './error.ts';
import type { ZapTransactHelpers } from './IStrategy.ts';
import type { UniswapLikeStrategyConfig } from './strategy-configs.ts';

type ZapHelpers = {
  chain: ChainEntity;
  pool: IUniswapLikePool;
  slippage: number;
  state: BeefyState;
};

type PartialWithdrawQuote<TAmm extends AmmEntityUniswapLike> = Pick<
  UniswapLikeWithdrawQuote<UniswapLikeWithdrawOption<TAmm>>,
  'steps' | 'outputs' | 'fee' | 'returned'
>;

/**
 * Base class for uniswap-v2-like strategies that have a IPool implementation
 */
export abstract class UniswapLikeStrategy<
  TAmm extends AmmEntityUniswapLike,
  TOptions extends UniswapLikeStrategyConfig<TAmm>,
> {
  protected readonly wnative: TokenErc20;
  protected readonly tokens: TokenEntity[];
  protected readonly lpTokens: TokenErc20[];
  protected readonly native: TokenNative;
  protected readonly amm: TAmm;
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;

  public abstract get id(): TOptions['strategyId'];

  protected abstract isAmmType(amm: AmmEntityUniswapLike): amm is TAmm;

  constructor(
    protected options: TOptions,
    protected helpers: ZapTransactHelpers
  ) {
    // Make sure zap was configured correctly for this vault
    const { vault, vaultType, getState } = this.helpers;

    if (!isStandardVault(vault)) {
      throw new Error('Vault is not a standard vault');
    }
    if (!isStandardVaultType(vaultType)) {
      throw new Error('Vault type is not standard');
    }

    onlyAssetCount(vault, 2);

    const state = getState();
    const amm = selectAmmById(state, this.options.ammId);
    if (!amm) {
      throw new Error(`Vault ${vault.id}: AMM ${this.options.ammId} not found`);
    }

    if (!isUniswapLikeAmm(amm)) {
      throw new Error(`Vault ${vault.id}: AMM ${this.options.ammId} is not uniswap-like`);
    }

    if (!this.isAmmType(amm)) {
      throw new Error(`Vault ${vault.id}: AMM ${this.options.ammId} is wrong AMM type`);
    }

    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        throw new Error(`Vault ${vault.id}: Asset ${vault.assetIds[i]} not loaded`);
      }
    }

    // Configure
    this.vault = vault;
    this.vaultType = vaultType;
    this.amm = amm;
    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
    this.tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    this.lpTokens = tokensToLp(this.tokens, this.wnative);
  }

  async aggregatorTokenSupport() {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const tokenSupport = await swapAggregator.fetchTokenSupport(
      this.lpTokens,
      this.vault.id,
      this.vault.chainId,
      state,
      this.options.swap
    );

    return tokenSupport.any.filter(token => {
      return this.lpTokens.every(
        (lpToken, i) =>
          isTokenEqual(token, lpToken) ||
          tokenSupport.tokens[i].some(supportedToken => isTokenEqual(supportedToken, token))
      );
    });
  }

  async fetchDepositOptions(): Promise<UniswapLikeDepositOption<TAmm>[]> {
    // what tokens can we can zap via pool with
    const tokensWithNativeWrapped = includeWrappedAndNative(this.tokens, this.wnative, this.native);
    const poolTokens = tokensWithNativeWrapped.map(token => ({
      token,
      swap: 'pool' as const,
    }));

    // what tokens we can zap via swap aggregator with
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const aggregatorTokens = supportedAggregatorTokens
      .filter(token => !isTokenEqual(token, this.vaultType.depositToken))
      .map(token => ({ token, swap: 'aggregator' as const }));

    const zapTokens = [...poolTokens, ...aggregatorTokens];
    const outputs = [this.vaultType.depositToken];

    return zapTokens.map(({ token, swap }) => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, swap),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder:
          tokenInList(token, tokensWithNativeWrapped) ?
            SelectionOrder.TokenOfPool
          : SelectionOrder.Other,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId: this.id,
        depositToken: this.vaultType.depositToken,
        lpTokens: this.lpTokens,
        swapVia: swap,
      } as const satisfies UniswapLikeDepositOption<TAmm>;
    });
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: UniswapLikeDepositOption<TAmm>
  ): Promise<UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Uniswap v2 strategy: Quote called with 0 input amount');
    }

    if (option.swapVia === 'pool') {
      return this.fetchDepositQuotePool(input, option);
    } else {
      return this.fetchDepositQuoteAggregator(input, option);
    }
  }

  protected async fetchDepositQuotePool(
    input: InputTokenAmount,
    option: UniswapLikeDepositOption<TAmm>
  ): Promise<UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>> {
    const { zap, swapAggregator, getState } = this.helpers;
    const { depositToken } = option;
    const state = getState();
    const chain = selectChainById(state, this.native.chainId);
    const isInputNative = isTokenNative(input.token);
    const swapInToken = isInputNative ? this.wnative : input.token;
    const swapInIsToken0 = isTokenEqual(swapInToken, this.lpTokens[0]);
    const swapOutToken = swapInIsToken0 ? this.lpTokens[1] : this.lpTokens[0];
    const pool = await getUniswapLikePool(option.depositToken.address, this.amm, chain); // TODO we can maybe make pools immutable and share 1 pool between all quotes

    // Token allowances
    const allowances =
      isTokenErc20(input.token) ?
        [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: zap.manager,
          },
        ]
      : [];

    // Swap
    const swapInAmountWei = pool.getOptimalSwapAmount(
      toWei(input.amount, input.token.decimals),
      swapInToken.address
    );
    const swapInAmount = fromWei(swapInAmountWei, swapInToken.decimals);
    const amountLeft = input.amount.minus(swapInAmount);
    const swap = pool.swap(swapInAmountWei, swapInToken.address, true);
    const swapOutAmount = fromWei(swap.amountOut, swapOutToken.decimals);

    // Add liquidity
    const lpTokenAmounts = [
      { token: swapInToken, amount: amountLeft },
      { token: swapOutToken, amount: swapOutAmount },
    ];
    if (!swapInIsToken0) {
      lpTokenAmounts.reverse(); // in-place
    }

    const { liquidity } = pool.addLiquidity(
      toWei(lpTokenAmounts[0].amount, lpTokenAmounts[0].token.decimals),
      lpTokenAmounts[0].token.address,
      toWei(lpTokenAmounts[1].amount, lpTokenAmounts[1].token.decimals)
    );

    const liquidityAmount = fromWei(liquidity, depositToken.decimals);
    // const usedTokenAmounts = [addAmountA, addAmountB].map((amount, i) => ({
    //   token: lpTokens[i],
    //   amount: fromWei(amount, lpTokens[i].decimals),
    // }));
    // const returnedTokenAmounts = [returnedA, returnedB].map((amount, i) => ({
    //   token: lpTokens[i],
    //   amount: fromWei(amount, lpTokens[i].decimals),
    // }));

    // Build quote inputs
    const inputs = [input];

    // Build quote steps
    const steps: ZapQuoteStep[] = [];

    if (isInputNative && !nativeAndWrappedAreSame(input.token.chainId)) {
      const wrapQuotes = await swapAggregator.fetchQuotes(
        {
          fromAmount: input.amount,
          fromToken: input.token,
          toToken: this.wnative,
          vaultId: this.vault.id,
        },
        state,
        this.options.swap
      );
      const wrapQuote = first(wrapQuotes);
      if (!wrapQuote) {
        throw new Error('No wrap quotes found');
      }

      steps.push({
        type: 'swap',
        fromToken: wrapQuote.fromToken,
        fromAmount: wrapQuote.fromAmount,
        toToken: wrapQuote.toToken,
        toAmount: wrapQuote.toAmount,
        via: 'aggregator',
        providerId: wrapQuote.providerId,
        fee: wrapQuote.fee,
        quote: wrapQuote,
      });
    }

    steps.push({
      type: 'swap',
      fromToken: swapInToken,
      fromAmount: swapInAmount,
      toToken: swapOutToken,
      toAmount: swapOutAmount,
      via: 'pool',
      providerId: depositToken.providerId || 'unknown',
    });

    steps.push({
      type: 'build',
      inputs: lpTokenAmounts,
      outputToken: depositToken,
      outputAmount: liquidityAmount,
    });

    steps.push({
      type: 'deposit',
      inputs: [{ token: depositToken, amount: liquidityAmount }],
    });

    // Build quote outputs
    const outputs: TokenAmount[] = [
      {
        token: depositToken,
        amount: liquidityAmount,
      },
    ];

    // Build dust outputs
    const returned: TokenAmount[] = [];

    // Build quote
    return {
      id: createQuoteId(option.id),
      strategyId: this.id,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state), // includes the zap fee
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: ZERO_FEE,
      quote: {
        from: { token: swapInToken, amount: swapInAmount },
        to: { token: swapOutToken, amount: swapOutAmount },
      },
    };
  }

  protected async fetchDepositQuoteAggregator(
    input: InputTokenAmount,
    option: UniswapLikeDepositOption<TAmm>
  ): Promise<UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>> {
    const { zap, swapAggregator, getState } = this.helpers;
    const { lpTokens, depositToken } = option;

    const state = getState();
    const chain = selectChainById(state, this.vault.chainId);
    const pool = await getUniswapLikePool(depositToken.address, this.amm, chain);

    // Token allowances
    const allowances =
      isTokenErc20(input.token) ?
        [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: zap.manager,
          },
        ]
      : [];

    // How much input to swap to each lp token
    const swapInAmounts = Object.values(
      pool.getAddLiquidityRatio(toWei(input.amount, input.token.decimals))
    ).map(amount => fromWei(amount, input.token.decimals));

    console.log('fetchDepositQuoteAggregator::swapInAmounts', bigNumberToStringDeep(swapInAmounts));

    // Swap quotes
    const quoteRequestsPerLpToken: (QuoteRequest | undefined)[] = lpTokens.map((lpTokenN, i) =>
      isTokenEqual(lpTokenN, input.token) ? undefined : (
        {
          vaultId: this.vault.id,
          fromToken: input.token,
          fromAmount: swapInAmounts[i],
          toToken: lpTokenN,
        }
      )
    );

    const quotesPerLpToken = await Promise.all(
      quoteRequestsPerLpToken.map(async quoteRequest => {
        if (!quoteRequest) {
          return undefined;
        }

        return await swapAggregator.fetchQuotes(quoteRequest, state, this.options.swap);
      })
    );

    const quotePerLpToken = quotesPerLpToken.map((quotes, i) => {
      if (quotes === undefined) {
        const quoteRequest = quoteRequestsPerLpToken[i];
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

    // Build LP
    const lpTokenAmounts = quotePerLpToken.map((quote, i) => {
      if (quote) {
        return { token: quote.toToken, amount: quote.toAmount };
      }
      return { token: lpTokens[i], amount: swapInAmounts[i] };
    });

    console.log(
      'fetchDepositQuoteAggregator::lpTokenAmounts',
      bigNumberToStringDeep(lpTokenAmounts)
    );

    const { liquidity } = pool.addLiquidity(
      toWei(lpTokenAmounts[0].amount, lpTokenAmounts[0].token.decimals),
      lpTokenAmounts[0].token.address,
      toWei(lpTokenAmounts[1].amount, lpTokenAmounts[1].token.decimals)
    );

    const liquidityAmount = fromWei(liquidity, depositToken.decimals);
    // const usedTokenAmounts = [addAmountA, addAmountB].map((amount, i) => ({
    //   token: lpTokens[i],
    //   amount: fromWei(amount, lpTokens[i].decimals),
    // }));
    // const returnedTokenAmounts = [returnedA, returnedB].map((amount, i) => ({
    //   token: lpTokens[i],
    //   amount: fromWei(amount, lpTokens[i].decimals),
    // }));

    // Build quote inputs
    const inputs = [input];

    // Build quote steps
    const steps: ZapQuoteStep[] = [];

    quotePerLpToken.forEach(quote => {
      if (quote) {
        steps.push({
          type: 'swap',
          fromToken: quote.fromToken,
          fromAmount: quote.fromAmount,
          toToken: quote.toToken,
          toAmount: quote.toAmount,
          via: 'aggregator',
          providerId: quote.providerId,
          fee: quote.fee,
          quote,
        });
      }
    });

    steps.push({
      type: 'build',
      inputs: lpTokenAmounts,
      outputToken: depositToken,
      outputAmount: liquidityAmount,
    });

    steps.push({
      type: 'deposit',
      inputs: [{ token: depositToken, amount: liquidityAmount }],
    });

    // Build quote outputs
    const outputs: TokenAmount[] = [
      {
        token: depositToken,
        amount: liquidityAmount,
      },
    ];

    // Build dust outputs
    const returned: TokenAmount[] = [];

    // Build quote
    return {
      id: createQuoteId(option.id),
      strategyId: this.id,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state), // includes the zap fee
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: highestFeeOrZero(steps),
      lpQuotes: quotePerLpToken,
    };
  }

  protected async fetchZapSwap(
    quoteStep: ZapQuoteStepSwap,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    if (isZapQuoteStepSwapPool(quoteStep)) {
      return this.fetchZapSwapPool(quoteStep, zapHelpers, insertBalance);
    } else if (isZapQuoteStepSwapAggregator(quoteStep)) {
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
    const { swapAggregator, zap } = this.helpers;
    const { slippage, state } = zapHelpers;

    return await fetchZapAggregatorSwap(
      {
        quote: quoteStep.quote,
        inputs: [{ token: quoteStep.fromToken, amount: quoteStep.fromAmount }],
        outputs: [{ token: quoteStep.toToken, amount: quoteStep.toAmount }],
        maxSlippage: slippage,
        zapRouter: zap.router,
        providerId: quoteStep.providerId,
        insertBalance,
      },
      swapAggregator,
      state
    );
  }

  protected async fetchZapSwapPool(
    quoteStep: ZapQuoteStepSwapPool,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage, pool } = zapHelpers;
    const swapInAmountWei = toWei(quoteStep.fromAmount, quoteStep.fromToken.decimals);
    const swap = pool.swap(swapInAmountWei, quoteStep.fromToken.address, true);
    const swapOutAmount = fromWei(swap.amountOut, quoteStep.toToken.decimals);

    if (swapOutAmount.lt(quoteStep.toAmount)) {
      console.debug(
        'fetchZapSwapPool',
        bigNumberToStringDeep(quoteStep),
        bigNumberToStringDeep(swap)
      );
      throw new QuoteChangedError(
        `Expected output changed between quote and transaction when swapping ${quoteStep.fromToken.symbol} to ${quoteStep.toToken.symbol}.`
      );
    }

    return await pool.getZapSwap({
      inputs: [{ token: quoteStep.fromToken, amount: quoteStep.fromAmount }],
      outputs: [{ token: quoteStep.toToken, amount: swapOutAmount }],
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: insertBalance, // whether to insert 100% of balance of input to calldata
    });
  }

  protected async fetchZapBuild(
    quoteStep: ZapQuoteStepBuild,
    minInputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage, pool } = zapHelpers;

    // Inputs are the minimum expected amounts, assuming all swaps slip 100%
    const {
      liquidity: liquidityWei,
      addAmountA,
      addAmountB,
    } = pool.addLiquidity(
      toWei(minInputs[0].amount, minInputs[0].token.decimals),
      minInputs[0].token.address,
      toWei(minInputs[1].amount, minInputs[1].token.decimals)
    );

    const liquidity = fromWei(liquidityWei, quoteStep.outputToken.decimals);
    const addAmounts = [addAmountA, addAmountB].map((amount, i) => ({
      token: minInputs[i].token,
      amount: fromWei(amount, minInputs[i].token.decimals),
    }));

    return await pool.getZapAddLiquidity({
      inputs: addAmounts,
      outputs: [{ token: quoteStep.outputToken, amount: liquidity }],
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  protected async fetchZapSplit(
    quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage, pool } = zapHelpers;

    const { amount0, amount1, token0, token1 } = pool.removeLiquidity(
      toWei(inputs[0].amount, inputs[0].token.decimals),
      true
    );

    const quoteIndexes = [token0, token1].map(address =>
      quoteStep.outputs.findIndex(
        output => output.token.address.toLowerCase() === address.toLowerCase()
      )
    );

    const outputs = [amount0, amount1].map((amount, i) => {
      if (quoteIndexes[i] === -1) {
        throw new Error('Invalid output token');
      }

      const quoteOutput = quoteStep.outputs[quoteIndexes[i]];
      const token = quoteOutput.token;
      const amountOut = fromWei(amount, token.decimals);
      if (amountOut.lt(quoteOutput.amount)) {
        console.debug('fetchZapSplit', {
          quote: quoteOutput.amount.toString(10),
          now: amountOut.toString(10),
        });
        throw new QuoteChangedError(
          'Expected output changed between quote and transaction when breaking LP.'
        );
      }

      return {
        token,
        amount: amountOut,
      };
    });

    return await pool.getZapRemoveLiquidity({
      inputs: inputs,
      outputs: outputs,
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  async fetchDepositStep(
    quote: UniswapLikeDepositQuote<UniswapLikeDepositOption<TAmm>>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, this.vault.chainId);
      const pool = await getUniswapLikePool(this.vaultType.depositToken.address, this.amm, chain);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, pool, slippage, state };
      const steps: ZapStep[] = [];
      const minBalances = new Balances(quote.inputs);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const buildQuote = quote.steps.find(isZapQuoteStepBuild);

      if (!buildQuote || swapQuotes.length === 0 || swapQuotes.length > 2) {
        throw new Error('Invalid quote');
      }

      // Swaps
      const insertBalance = allTokensAreDistinct(
        swapQuotes
          .map(quoteStep => quoteStep.fromToken)
          .concat(buildQuote.inputs.map(({ token }) => token))
      );
      const swapZaps = await Promise.all(
        swapQuotes.map(quoteStep => this.fetchZapSwap(quoteStep, zapHelpers, insertBalance))
      );
      swapZaps.forEach(swap => {
        // add step to order
        swap.zaps.forEach(step => steps.push(step));
        // track the minimum balances for use in further steps
        minBalances.subtractMany(swap.inputs);
        minBalances.addMany(swap.minOutputs);
      });

      // Build LP
      const buildZap = await this.fetchZapBuild(
        buildQuote,
        buildQuote.inputs.map(({ token }) => ({
          token,
          amount: minBalances.get(token), // we have to pass min expected in case swaps slipped
        })),
        zapHelpers
      );
      buildZap.zaps.forEach(step => steps.push(step));
      minBalances.subtractMany(buildZap.inputs);
      minBalances.addMany(buildZap.minOutputs);

      // Deposit in vault
      const vaultDeposit = await this.vaultType.fetchZapDeposit({
        inputs: [
          {
            token: buildQuote.outputToken,
            amount: minBalances.get(buildQuote.outputToken), // min expected in case add liquidity slipped
            max: true, // but we call depositAll
          },
        ],
        from: this.helpers.zap.router,
      });
      steps.push(vaultDeposit.zap);

      console.log('fetchDepositStep::vaultDeposit', vaultDeposit);

      // Build order
      const inputs: OrderInput[] = quote.inputs.map(input => ({
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      }));

      const requiredOutputs: OrderOutput[] = vaultDeposit.outputs.map(output => ({
        token: getTokenAddress(output.token),
        minOutputAmount: toWeiString(
          slipBy(output.amount, slippage, output.token.decimals),
          output.token.decimals
        ),
      }));

      // We need to list all inputs, and mid-route outputs, as outputs so dust gets returned
      const dustOutputs: OrderOutput[] = pickTokens(
        quote.outputs,
        quote.inputs,
        quote.returned
      ).map(token => ({
        token: getTokenAddress(token),
        minOutputAmount: '0',
      }));

      swapQuotes.forEach(quoteStep => {
        dustOutputs.push({
          token: getTokenAddress(quoteStep.fromToken),
          minOutputAmount: '0',
        });
        dustOutputs.push({
          token: getTokenAddress(quoteStep.toToken),
          minOutputAmount: '0',
        });
      });
      dustOutputs.push({
        token: getTokenAddress(buildQuote.outputToken),
        minOutputAmount: '0',
      });

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

      const expectedTokens = vaultDeposit.outputs.map(output => output.token);
      const walletAction = zapExecuteOrder(quote.option.vaultId, zapRequest, expectedTokens);

      return walletAction(dispatch, getState, extraArgument);
    };

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: { zap: true, vaultId: quote.option.vaultId },
    };
  }

  async fetchWithdrawOptions(): Promise<UniswapLikeWithdrawOption<TAmm>[]> {
    // what tokens can we directly zap with
    const tokensWithNativeWrapped = includeWrappedAndNative(this.tokens, this.wnative, this.native);
    const poolTokens = tokensWithNativeWrapped.map(token => ({
      token,
      swap: 'pool' as const,
    }));

    // what tokens we can zap via swap aggregator with
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const aggregatorTokens = supportedAggregatorTokens
      .filter(token => !isTokenEqual(token, this.vaultType.depositToken))
      .map(token => ({ token, swap: 'aggregator' as const }));

    const zapTokens = [...poolTokens, ...aggregatorTokens];
    const inputs = [this.vaultType.depositToken];

    const breakSelectionId = createSelectionId(this.vault.chainId, this.lpTokens);
    const breakOption: UniswapLikeWithdrawOption<TAmm> = {
      id: createOptionId(this.id, this.vault.id, breakSelectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId: breakSelectionId,
      selectionOrder: SelectionOrder.AllTokensInPool,
      inputs,
      wantedOutputs: this.lpTokens,
      mode: TransactMode.Withdraw,
      strategyId: this.id,
      depositToken: this.vaultType.depositToken,
      lpTokens: this.lpTokens,
    };

    return [breakOption].concat(
      zapTokens.map(({ token, swap }) => {
        const outputs = [token];
        const selectionId = createSelectionId(this.vault.chainId, outputs);

        return {
          id: createOptionId(this.id, this.vault.id, selectionId, swap),
          vaultId: this.vault.id,
          chainId: this.vault.chainId,
          selectionId,
          selectionOrder:
            tokenInList(token, tokensWithNativeWrapped) ?
              SelectionOrder.TokenOfPool
            : SelectionOrder.Other,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Withdraw,
          strategyId: this.id,
          depositToken: this.vaultType.depositToken,
          lpTokens: this.lpTokens,
          swapVia: swap,
        };
      })
    );
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: UniswapLikeWithdrawOption<TAmm>
  ): Promise<UniswapLikeWithdrawQuote<UniswapLikeWithdrawOption<TAmm>>> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    const { zap, getState } = this.helpers;

    // Common: Withdraw from vault
    const state = getState();
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, this.vault, state);
    const withdrawnAmountAfterFee = fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals);
    const chain = selectChainById(state, this.vault.chainId);
    const breakSteps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        outputs: [
          {
            token: this.vaultType.depositToken,
            amount: withdrawnAmountAfterFee,
          },
        ],
      },
    ];

    // Common: Token Allowances
    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: zap.manager,
      },
    ];

    // common: break the LP
    const pool = await getUniswapLikePool(option.depositToken.address, this.amm, chain);
    const { amount0, amount1, token0, token1 } = pool.removeLiquidity(
      withdrawnAmountAfterFeeWei,
      true
    );
    const breakReturned: TokenAmount[] = [];
    const breakOutputs: TokenAmount[] = [
      { amount: amount0, address: token0 },
      { amount: amount1, address: token1 },
    ].map(({ amount, address }) => {
      const token = this.lpTokens.find(
        token => token.address.toLowerCase() === address.toLowerCase()
      );
      if (!token) {
        throw new Error(`LP token ${address} not found`);
      }

      return { amount: fromWei(amount, token.decimals), token };
    });
    breakSteps.push({
      type: 'split',
      inputToken: this.vaultType.depositToken,
      inputAmount: withdrawnAmountAfterFee,
      outputs: breakOutputs,
    });

    let outputs: TokenAmount[];
    let returned: TokenAmount[];
    let fee: ZapFee;
    let steps: ZapQuoteStep[];

    if (option.swapVia === 'pool') {
      ({ outputs, returned, steps, fee } = await this.fetchWithdrawQuotePool(
        option,
        breakOutputs,
        breakReturned,
        breakSteps,
        pool
      ));
    } else if (option.swapVia === 'aggregator') {
      ({ outputs, returned, steps, fee } = await this.fetchWithdrawQuoteAggregator(
        option,
        breakOutputs,
        breakReturned,
        breakSteps
      ));
    } else {
      outputs = breakOutputs;
      steps = breakSteps;
      returned = breakReturned;
      fee = ZERO_FEE;
    }

    // return break only
    return {
      id: createQuoteId(option.id),
      strategyId: this.id,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee,
    };
  }

  async fetchWithdrawQuotePool(
    option: UniswapLikeWithdrawOption<TAmm>,
    breakOutputs: TokenAmount[],
    breakReturned: TokenAmount[],
    steps: ZapQuoteStep[],
    pool: IUniswapLikePool
  ): Promise<PartialWithdrawQuote<TAmm>> {
    const { wantedOutputs, depositToken } = option;
    const wantedOutput = onlyOneToken(wantedOutputs);
    const isWantedOutputNative = isTokenNative(wantedOutput);
    const lpOutput = isWantedOutputNative ? this.wnative : wantedOutput;
    if (!this.lpTokens.some(token => isTokenEqual(token, lpOutput))) {
      throw new Error('Wanted output token is not in the LP');
    }
    if (!breakOutputs.some(tokenAmount => isTokenEqual(tokenAmount.token, lpOutput))) {
      throw new Error('Wanted output token is not one of the break lp outputs');
    }

    const swapTokenAmount = breakOutputs.find(
      tokenAmount => !isTokenEqual(tokenAmount.token, lpOutput)
    );
    if (!swapTokenAmount) {
      throw new Error('Swap token is not one of the break lp outputs');
    }
    const swapInAmountWei = tokenAmountToWei(swapTokenAmount);
    const swap = pool.swap(swapInAmountWei, swapTokenAmount.token.address, false);
    const swapOutAmount = fromWei(swap.amountOut, lpOutput.decimals);
    const keepTokenAmount = breakOutputs.find(tokenAmount =>
      isTokenEqual(tokenAmount.token, lpOutput)
    );
    if (!keepTokenAmount) {
      throw new Error('Wanted token is not one of the break lp outputs');
    }

    steps.push({
      type: 'swap',
      fromToken: swapTokenAmount.token,
      fromAmount: swapTokenAmount.amount,
      toToken: lpOutput,
      toAmount: swapOutAmount,
      via: 'pool',
      providerId: depositToken.providerId || 'unknown',
    });

    const outputAmount = keepTokenAmount.amount.plus(swapOutAmount);
    if (isWantedOutputNative && !nativeAndWrappedAreSame(wantedOutput.chainId)) {
      const { swapAggregator, getState } = this.helpers;
      const state = getState();
      const unwrapQuotes = await swapAggregator.fetchQuotes(
        {
          fromAmount: outputAmount,
          fromToken: this.wnative,
          toToken: this.native,
          vaultId: this.vault.id,
        },
        state,
        this.options.swap
      );
      const unwrapQuote = first(unwrapQuotes);
      if (!unwrapQuote || unwrapQuote.toAmount.lt(outputAmount)) {
        throw new Error('No unwrap quote found');
      }

      steps.push({
        type: 'swap',
        fromToken: unwrapQuote.fromToken,
        fromAmount: unwrapQuote.fromAmount,
        toToken: unwrapQuote.toToken,
        toAmount: unwrapQuote.toAmount,
        via: 'aggregator',
        providerId: unwrapQuote.providerId,
        fee: unwrapQuote.fee,
        quote: unwrapQuote,
      });
    }

    const outputs: TokenAmount[] = [{ token: wantedOutput, amount: outputAmount }];

    return {
      outputs,
      returned: breakReturned,
      steps,
      fee: highestFeeOrZero(steps),
    };
  }

  async fetchWithdrawQuoteAggregator(
    option: UniswapLikeWithdrawOption<TAmm>,
    breakOutputs: TokenAmount[],
    breakReturned: TokenAmount[],
    steps: ZapQuoteStep[]
  ): Promise<PartialWithdrawQuote<TAmm>> {
    const { wantedOutputs } = option;
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const wantedOutput = onlyOneToken(wantedOutputs);
    const needsSwap = breakOutputs.map(
      tokenAmount => !isTokenEqual(wantedOutput, tokenAmount.token)
    );

    const swapQuotes = await Promise.all(
      breakOutputs.map(async (input, i) => {
        if (needsSwap[i]) {
          const quotes = await swapAggregator.fetchQuotes(
            {
              fromAmount: input.amount,
              fromToken: input.token,
              toToken: wantedOutput,
              vaultId: option.vaultId,
            },
            state,
            this.options.swap
          );

          if (!quotes || !quotes.length) {
            throw new Error(`No quotes found for ${input.token.symbol} -> ${wantedOutput.symbol}`);
          }

          return first(quotes); // already sorted by toAmount
        }

        return undefined;
      })
    );

    let outputTotal = new BigNumber(0);
    breakOutputs.forEach((input, i) => {
      if (needsSwap[i]) {
        const swapQuote = swapQuotes[i];
        if (!swapQuote) {
          throw new Error('No swap quote found');
        }

        outputTotal = outputTotal.plus(swapQuote.toAmount);

        steps.push({
          type: 'swap',
          fromToken: input.token,
          fromAmount: input.amount,
          toToken: swapQuote.toToken,
          toAmount: swapQuote.toAmount,
          via: 'aggregator',
          providerId: swapQuote.providerId,
          fee: swapQuote.fee,
          quote: swapQuote,
        });
      } else {
        outputTotal = outputTotal.plus(input.amount);
      }
    });

    const outputs: TokenAmount[] = [{ token: wantedOutput, amount: outputTotal }];

    return {
      outputs,
      returned: breakReturned,
      steps,
      fee: highestFeeOrZero(steps),
    };
  }

  async fetchWithdrawStep(
    quote: UniswapLikeWithdrawQuote<UniswapLikeWithdrawOption<TAmm>>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, this.vault.chainId);
      const pool = await getUniswapLikePool(this.vaultType.depositToken.address, this.amm, chain);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, pool, slippage, state };
      const withdrawQuote = quote.steps.find(isZapQuoteStepWithdraw);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const splitQuote = quote.steps.find(isZapQuoteStepSplit);

      if (!withdrawQuote || !splitQuote) {
        throw new Error('Invalid withdraw quote');
      }

      // Step 1. Withdraw from vault
      const vaultWithdraw = await this.vaultType.fetchZapWithdraw({
        inputs: quote.inputs,
        from: this.helpers.zap.router,
      });
      if (vaultWithdraw.outputs.length !== 1) {
        throw new Error('Withdraw output count mismatch');
      }

      const withdrawOutput = first(vaultWithdraw.outputs)!; // we checked length above
      if (!isTokenEqual(withdrawOutput.token, splitQuote.inputToken)) {
        throw new Error('Withdraw output token mismatch');
      }

      if (withdrawOutput.amount.lt(withdrawQuote.toAmount)) {
        throw new Error('Withdraw output amount mismatch');
      }

      const steps: ZapStep[] = [vaultWithdraw.zap];

      // Step 2. Split lp
      const splitZap = await this.fetchZapSplit(splitQuote, [withdrawOutput], zapHelpers);
      splitZap.zaps.forEach(step => steps.push(step));

      // Step 3. Swaps
      // 0 swaps is valid when we break only
      if (swapQuotes.length > 0) {
        if (swapQuotes.length > 2) {
          throw new Error('Invalid swap quote');
        }

        const insertBalance = allTokensAreDistinct(
          swapQuotes.map(quoteStep => quoteStep.fromToken)
        );
        // On withdraw zap the last swap can use 100% of balance even if token was used in previous swaps (since there are no further steps)
        const lastSwapIndex = swapQuotes.length - 1;
        const swapZaps = await Promise.all(
          swapQuotes.map((quoteStep, i) =>
            this.fetchZapSwap(quoteStep, zapHelpers, insertBalance || lastSwapIndex === i)
          )
        );
        swapZaps.forEach(swap => swap.zaps.forEach(step => steps.push(step)));
      }

      // Build order
      const inputs: OrderInput[] = vaultWithdraw.inputs.map(input => ({
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      }));

      const requiredOutputs: OrderOutput[] = quote.outputs.map(output => ({
        token: getTokenAddress(output.token),
        minOutputAmount: toWeiString(
          slipBy(output.amount, slippage, output.token.decimals),
          output.token.decimals
        ),
      }));

      // We need to list all inputs, and mid-route outputs, as outputs so dust gets returned
      const dustOutputs: OrderOutput[] = pickTokens(
        vaultWithdraw.inputs,
        quote.outputs,
        quote.inputs,
        quote.returned,
        splitQuote.outputs
      ).map(token => ({
        token: getTokenAddress(token),
        minOutputAmount: '0',
      }));

      swapQuotes.forEach(quoteStep => {
        dustOutputs.push({
          token: getTokenAddress(quoteStep.fromToken),
          minOutputAmount: '0',
        });
        dustOutputs.push({
          token: getTokenAddress(quoteStep.toToken),
          minOutputAmount: '0',
        });
      });

      // @dev uniqBy: first occurrence of each element is kept -> required outputs are kept
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

      const expectedTokens = quote.outputs.map(output => output.token);
      const walletAction = zapExecuteOrder(quote.option.vaultId, zapRequest, expectedTokens);

      return walletAction(dispatch, getState, extraArgument);
    };

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: { zap: true, vaultId: quote.option.vaultId },
    };
  }
}
