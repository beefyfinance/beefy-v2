import BigNumber from 'bignumber.js';
import { first, orderBy, uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
  compareBigNumber,
  fromWei,
  fromWeiToTokenAmount,
  toWeiFromTokenAmount,
  toWeiString,
} from '../../../../../../helpers/big-number.ts';
import { isFulfilledResult } from '../../../../../../helpers/promises.ts';
import { tokenInList } from '../../../../../../helpers/tokens.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import {
  isTokenEqual,
  isTokenErc20,
  type TokenEntity,
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token.ts';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault.ts';
import { type AmmEntityBalancer, isBalancerAmm } from '../../../../entities/zap.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectTokenByAddressOrUndefined,
  selectTokenPriceByTokenOracleId,
} from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectAmmById } from '../../../../selectors/zap.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { isDefined } from '../../../../utils/array-utils.ts';
import { createFactory } from '../../../../utils/factory-utils.ts';
import {
  isBalancerAllPool,
  isBalancerSinglePool,
} from '../../../amm/balancer/common/type-guards.ts';
import { ComposableStablePool } from '../../../amm/balancer/composable-stable/ComposableStablePool.ts';
import { GyroPool } from '../../../amm/balancer/gyro/GyroPool.ts';
import { MetaStablePool } from '../../../amm/balancer/meta-stable/MetaStablePool.ts';
import { BalancerFeature } from '../../../amm/balancer/types.ts';
import type { PoolConfig, VaultConfig } from '../../../amm/balancer/vault/types.ts';
import { WeightedPool } from '../../../amm/balancer/weighted/WeightedPool.ts';
import { mergeTokenAmounts, slipBy, slipTokenAmountBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
  onlyOneTokenAmount,
} from '../../helpers/options.ts';
import {
  calculatePriceImpact,
  highestFeeOrZero,
  totalValueOfTokenAmounts,
} from '../../helpers/quotes.ts';
import { allTokensAreDistinct, includeWrappedAndNative, pickTokens } from '../../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../../helpers/vault.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import type { QuoteRequest, QuoteResponse } from '../../swap/ISwapProvider.ts';
import {
  type BalancerDepositOption,
  type BalancerDepositOptionAllAggregator,
  type BalancerDepositOptionSingleAggregator,
  type BalancerDepositQuote,
  type BalancerWithdrawOption,
  type BalancerWithdrawOptionAllAggregator,
  type BalancerWithdrawOptionAllBreakOnly,
  type BalancerWithdrawOptionSingleAggregator,
  type BalancerWithdrawOptionSingleDirect,
  type BalancerWithdrawQuote,
  type InputTokenAmount,
  isZapQuoteStepBuild,
  isZapQuoteStepSplit,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepWithdraw,
  SelectionOrder,
  type TokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepBuild,
  type ZapQuoteStepSwap,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types.ts';
import { isStandardVaultType, type IStandardVaultType } from '../../vaults/IVaultType.ts';
import { fetchZapAggregatorSwap } from '../../zap/swap.ts';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepResponse,
} from '../../zap/types.ts';
import type { IZapStrategy, IZapStrategyStatic, ZapTransactHelpers } from '../IStrategy.ts';
import type { BalancerStrategyConfig } from '../strategy-configs.ts';

type ZapHelpers = {
  slippage: number;
  state: BeefyState;
};

const strategyId = 'balancer';
type StrategyId = typeof strategyId;

/**
 * Balancer: joinPool() to deposit / exitPool() to withdraw liquidity
 */
class BalancerStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected readonly native: TokenNative;
  protected readonly wnative: TokenErc20;
  protected readonly poolTokens: TokenEntity[];
  protected readonly poolTokensincludingWrappedNative: TokenEntity[];
  protected readonly chain: ChainEntity;
  protected readonly depositToken: TokenEntity;
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;
  protected readonly amm: AmmEntityBalancer;
  protected readonly singleTokenOptions: TokenEntity[];
  protected readonly allTokenOptions: TokenEntity[];

  constructor(
    protected options: BalancerStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    const { vault, vaultType, getState } = this.helpers;

    if (!isStandardVault(vault)) {
      throw new Error('Vault is not a standard vault');
    }
    if (!isStandardVaultType(vaultType)) {
      throw new Error('Vault type is not standard');
    }

    const state = getState();
    const amm = selectAmmById(state, this.options.ammId);
    if (!amm) {
      throw new Error(`Vault ${vault.id}: AMM ${this.options.ammId} not found`);
    }
    if (!isBalancerAmm(amm)) {
      throw new Error(`Vault ${vault.id}: AMM ${this.options.ammId} is not balancer type`);
    }

    this.amm = amm;
    this.vault = vault;
    this.vaultType = vaultType;
    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
    this.depositToken = vaultType.depositToken;
    this.chain = selectChainById(state, vault.chainId);
    this.poolTokens = this.selectPoolTokens(state, this.chain.id, this.options.tokens);
    this.poolTokensincludingWrappedNative = includeWrappedAndNative(
      this.poolTokens,
      this.wnative,
      this.native
    );
    this.singleTokenOptions = this.selectSingleTokenOptions(state);
    this.allTokenOptions = this.selectAllTokenOptions(state);
    if (this.singleTokenOptions.length === 0 && this.allTokenOptions.length === 0) {
      throw new Error('No token options available');
    }
    this.validatePoolType();
  }

  protected selectSingleTokenOptions(state: BeefyState): TokenEntity[] {
    const pool = this.getPool();
    if (!isBalancerSinglePool(pool)) {
      return [];
    }

    // Can join with any token we have a price for
    return this.poolTokens
      .map(token => {
        const price = selectTokenPriceByTokenOracleId(state, token.oracleId);
        if (!price || price.lte(BIG_ZERO)) {
          return undefined;
        }

        return token;
      })
      .filter(isDefined);
  }

  protected selectAllTokenOptions(state: BeefyState): TokenEntity[] {
    const pool = this.getPool();
    if (!isBalancerAllPool(pool)) {
      return [];
    }

    // Every token must have a price
    if (
      !this.poolTokens.every(token => {
        const price = selectTokenPriceByTokenOracleId(state, token.oracleId);
        return price && price.gt(BIG_ZERO);
      })
    ) {
      return [];
    }

    return this.poolTokens;
  }

  protected validatePoolType() {
    // Check pool type specific requirements
    switch (this.options.poolType) {
      case 'gyroe':
      case 'gyro': {
        if (this.poolTokens.length !== 2) {
          throw new Error(`${this.options.poolType}: There must be exactly 2 pool tokens`);
        }
        break;
      }
      case 'weighted':
      case 'meta-stable':
      case 'composable-stable': {
        break;
      }
      default: {
        // @ts-expect-error - if all cases are handled
        throw new Error(`Unsupported balancer pool type ${this.options.poolType}`);
      }
    }
  }

  protected selectPoolTokens(
    state: BeefyState,
    chainId: ChainEntity['id'],
    tokenAddresses: string[]
  ): TokenEntity[] {
    const tokens = tokenAddresses
      .map(address => selectTokenByAddressOrUndefined(state, chainId, address))
      .filter(isDefined);
    if (tokens.length !== tokenAddresses.length) {
      // We need decimals for each token
      throw new Error('Not all tokens are in state');
    }
    return tokens;
  }

  protected async buildDepositOptionsForAll(): Promise<BalancerDepositOption[]> {
    if (!this.allTokenOptions.length) {
      return [];
    }

    const via = 'aggregator';
    const type = 'all';
    const outputs = [this.vaultType.depositToken];

    const supportedAggregatorTokens = await this.aggregatorTokensCanSwapToAllOf(
      this.allTokenOptions
    );
    const aggregatorTokens = supportedAggregatorTokens
      .filter(token => !isTokenEqual(token, this.vaultType.depositToken))
      .map(token => ({ token }));

    return aggregatorTokens.map(({ token }) => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, `${type}-${via}`),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder:
          tokenInList(token, this.poolTokensincludingWrappedNative) ?
            SelectionOrder.TokenOfPool
          : SelectionOrder.Other,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId,
        type,
        via,
        viaTokens: this.allTokenOptions,
      } as const satisfies BalancerDepositOption;
    });
  }

  protected async buildDepositOptionsForSingle(): Promise<BalancerDepositOption[]> {
    if (!this.singleTokenOptions.length) {
      return [];
    }

    const type = 'single';
    const outputs = [this.vaultType.depositToken];

    const baseOptions = this.singleTokenOptions.map(viaToken => {
      const inputs = [viaToken];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, `${type}-direct`),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.TokenOfPool,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId,
        type,
        via: 'direct',
        viaToken,
      } satisfies BalancerDepositOption;
    });

    const { inputTokens, inputTokenToWanted } = await this.aggregatorTokensCanSwapToTokens(
      this.singleTokenOptions
    );

    const aggregatorOptions = inputTokens.map(token => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);
      const viaTokens = inputTokenToWanted[token.address];

      if (viaTokens.length === 0) {
        console.error({ vault: this.vault.id, token, viaTokens });
        throw new Error(
          `No other tokens supported for ${token.symbol}; *** this should not happen ***`
        );
      }

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, `${type}-aggregator`),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder:
          tokenInList(token, this.poolTokensincludingWrappedNative) ?
            SelectionOrder.TokenOfPool
          : SelectionOrder.Other,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId,
        type,
        via: 'aggregator',
        viaTokens,
      } satisfies BalancerDepositOption;
    });

    return [...baseOptions, ...aggregatorOptions];
  }

  public async fetchDepositOptions(): Promise<BalancerDepositOption[]> {
    const singleOptions = await this.buildDepositOptionsForSingle();
    const allOptions = await this.buildDepositOptionsForAll();
    return [...singleOptions, ...allOptions];
  }

  protected getPool = createFactory(() => {
    const vault: VaultConfig = {
      vaultAddress: this.amm.vaultAddress,
      queryAddress: this.amm.queryAddress,
    };
    const pool: PoolConfig = {
      poolAddress: this.depositToken.address,
      poolId: this.options.poolId,
      tokens: this.poolTokens,
    };

    switch (this.options.poolType) {
      case 'gyro':
      case 'gyroe': {
        return new GyroPool(this.chain, vault, pool);
      }
      case 'weighted': {
        return new WeightedPool(this.chain, vault, pool);
      }
      case 'meta-stable': {
        return new MetaStablePool(this.chain, vault, pool);
      }
      case 'composable-stable': {
        return new ComposableStablePool(this.chain, vault, {
          ...pool,
          bptIndex: this.options.bptIndex,
        });
      }
      default: {
        // @ts-expect-error - if all cases are handled
        throw new Error(`Unsupported balancer pool type ${this.options.poolType}`);
      }
    }
  });

  public async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: BalancerDepositOption
  ): Promise<BalancerDepositQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('BalancerStrategy: Quote called with 0 input amount');
    }

    // Token allowances
    const { zap, getState } = this.helpers;
    const state = getState();
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

    // Swaps/Liquidity
    const { swaps, liquidity } = await this.fetchDepositSwapsLiquidity(input, option);

    // Build quote steps
    const steps: ZapQuoteStep[] = [];

    for (const swap of swaps) {
      if (swap.quote) {
        steps.push({
          type: 'swap',
          fromToken: swap.quote.fromToken,
          fromAmount: swap.quote.fromAmount,
          toToken: swap.quote.toToken,
          toAmount: swap.quote.toAmount,
          via: 'aggregator',
          providerId: swap.quote.providerId,
          fee: swap.quote.fee,
          quote: swap.quote,
        });
      }
    }

    steps.push({
      type: 'build',
      inputs: liquidity.inputs.filter(({ amount }) => amount.gt(BIG_ZERO)),
      outputToken: liquidity.output.token,
      outputAmount: liquidity.output.amount,
    });

    steps.push({
      type: 'deposit',
      inputs: [liquidity.output],
    });

    // Build quote outputs
    const outputs: TokenAmount[] = [liquidity.output];
    const returned: TokenAmount[] = [];

    // Build quote
    return {
      id: createQuoteId(option.id),
      strategyId,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state), // includes the zap fee
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: highestFeeOrZero(steps),
    };
  }

  protected async fetchDepositSwapsLiquidity(input: TokenAmount, option: BalancerDepositOption) {
    // Calculate swap inputs and outputs
    let swapSets: Array<
      {
        input: TokenAmount;
        output: TokenAmount;
        quote?: QuoteResponse;
      }[]
    >;
    if (option.type === 'all' && option.via === 'aggregator') {
      swapSets = await this.fetchDepositSwapQuotesAllAggregator(input, option);
    } else if (option.type === 'single' && option.via === 'aggregator') {
      swapSets = await this.fetchDepositSwapQuotesSingleAggregator(input, option);
    } else if (option.type === 'single' && option.via === 'direct') {
      swapSets = [[{ input, output: input }]];
    } else {
      // @ts-expect-error if all cases are handled
      throw new Error(`Unsupported deposit option type ${option.type} via ${option.via}`);
    }

    if (swapSets.length === 0) {
      throw new Error('No swap quotes found');
    }

    // Calculate how much liquidity we get
    const withLiquidity = await Promise.all(
      swapSets.map(async swaps => {
        const inputs = this.poolTokens.map(
          token =>
            swaps.find(swap => isTokenEqual(swap.output.token, token))?.output ?? {
              token,
              amount: BIG_ZERO,
            }
        );
        const liquidity = await this.quoteAddLiquidity(inputs);

        return {
          input,
          swaps,
          liquidity: {
            inputs: inputs,
            output: liquidity.liquidity,
            usedInput: liquidity.usedInput,
            unusedInput: liquidity.unusedInput,
          },
          output: liquidity.liquidity,
        };
      })
    );

    // sort by most liquidity
    withLiquidity.sort((a, b) => compareBigNumber(b.output.amount, a.output.amount));

    // the one which gives the most liquidity
    return withLiquidity[0];
  }

  protected async getSwapAmounts(input: TokenAmount): Promise<
    Array<{
      from: TokenAmount;
      to: TokenEntity;
    }>
  > {
    const pool = this.getPool();
    const ratios = await pool.getSwapRatios();
    console.debug('ratios', ratios.toString());
    if (ratios.length !== this.poolTokens.length) {
      throw new Error('BalancerStrategy: Ratios length mismatch');
    }

    const inputAmountWei = toWeiFromTokenAmount(input);
    const lastIndex = ratios.length - 1;
    const swapAmounts = ratios.map((ratio, i) =>
      i === lastIndex ? BIG_ZERO : (
        inputAmountWei.multipliedBy(ratio).integerValue(BigNumber.ROUND_FLOOR)
      )
    );
    swapAmounts[swapAmounts.length - 1] = swapAmounts.reduce(
      (acc, amount) => acc.minus(amount),
      inputAmountWei
    );

    return this.poolTokens.map((token, i) => ({
      from: fromWeiToTokenAmount(swapAmounts[i], input.token),
      to: token,
    }));
  }

  protected async quoteAddLiquidity(inputs: TokenAmount[]): Promise<{
    liquidity: TokenAmount;
    usedInput: TokenAmount[];
    unusedInput: TokenAmount[];
  }> {
    const pool = this.getPool();
    const inputAmountsWei = inputs.map(input => toWeiFromTokenAmount(input));
    const result = await pool.quoteAddLiquidity(inputAmountsWei);

    return {
      liquidity: fromWeiToTokenAmount(result.liquidity, this.depositToken),
      usedInput: inputs.map((input, i) => fromWeiToTokenAmount(result.usedInput[i], input.token)),
      unusedInput: inputs.map((input, i) =>
        fromWeiToTokenAmount(result.unusedInput[i], input.token)
      ),
    };
  }

  protected async fetchDepositSwapQuotesAllAggregator(
    input: TokenAmount,
    _option: BalancerDepositOptionAllAggregator
  ): Promise<
    Array<
      {
        input: TokenAmount;
        output: TokenAmount;
        quote?: QuoteResponse;
      }[]
    >
  > {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();

    // How much input to swap to each lp token
    const swapInAmounts = await this.getSwapAmounts(input);

    // Swap quotes
    const quoteRequestsPerLpToken: (QuoteRequest | undefined)[] = swapInAmounts.map(
      ({ from, to }) =>
        isTokenEqual(from.token, to) ? undefined : (
          {
            vaultId: this.vault.id,
            fromToken: from.token,
            fromAmount: from.amount,
            toToken: to,
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

    // Output
    return [
      quotePerLpToken.map((quote, i) => {
        if (quote) {
          return {
            input: swapInAmounts[i].from,
            output: { token: quote.toToken, amount: quote.toAmount },
            quote,
          };
        }

        return {
          input: swapInAmounts[i].from,
          output: swapInAmounts[i].from,
        };
      }),
    ];
  }

  protected async fetchDepositSwapQuotesSingleAggregator(
    input: TokenAmount,
    option: BalancerDepositOptionSingleAggregator
  ): Promise<
    Array<
      {
        input: TokenAmount;
        output: TokenAmount;
        quote?: QuoteResponse;
      }[]
    >
  > {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();

    // Fetch quotes from input token, to each possible deposit via token
    const maybeQuotes = await Promise.allSettled(
      option.viaTokens.map(async depositVia => {
        const quotes = await swapAggregator.fetchQuotes(
          {
            vaultId: this.vault.id,
            fromToken: input.token,
            fromAmount: input.amount,
            toToken: depositVia,
          },
          state,
          this.options.swap
        );
        const bestQuote = first(quotes);
        if (!bestQuote) {
          throw new Error(`No quote for ${input.token.symbol} to ${depositVia.symbol}`);
        }
        return { via: depositVia, quote: bestQuote };
      })
    );

    const quotes = maybeQuotes
      .filter(isFulfilledResult)
      .map(r => r.value)
      .filter(isDefined);

    if (!quotes.length) {
      throw new Error(`No quotes for ${input.token.symbol} to any deposit via token`);
    }

    return quotes.map(({ via, quote }) => [
      {
        input,
        output: { token: via, amount: quote.toAmount },
        quote,
      },
    ]);
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

  protected async fetchZapBuild(
    _quoteStep: ZapQuoteStepBuild,
    minInputs: TokenAmount[],
    _option: BalancerDepositOption,
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { liquidity, usedInput, unusedInput } = await this.quoteAddLiquidity(minInputs);
    const pool = this.getPool();
    const minLiquidity =
      pool.supportsFeature(BalancerFeature.AddSlippage) ?
        slipTokenAmountBy(liquidity, zapHelpers.slippage)
      : liquidity;

    return {
      inputs: usedInput,
      outputs: [liquidity],
      minOutputs: [minLiquidity],
      returned: unusedInput,
      zaps: [
        await pool.getAddLiquidityZap(
          usedInput.map(input => toWeiFromTokenAmount(input)),
          toWeiFromTokenAmount(minLiquidity),
          this.helpers.zap.router,
          true
        ),
      ],
    };
  }

  public async fetchDepositStep(
    quote: BalancerDepositQuote,
    t: TFunction<Namespace<string>>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = {
        slippage,
        state,
      };
      const steps: ZapStep[] = [];
      const minBalances = new Balances(quote.inputs);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const buildQuote = quote.steps.find(isZapQuoteStepBuild);

      if (!buildQuote) {
        throw new Error('BalancerStrategy: No build step in quote');
      }

      // Swaps
      if (swapQuotes.length) {
        if (swapQuotes.length > this.poolTokens.length) {
          throw new Error('BalancerStrategy: Too many swaps');
        }

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
      }

      // Build LP
      const buildZap = await this.fetchZapBuild(
        buildQuote,
        this.poolTokens.map(token => ({
          token,
          amount: minBalances.get(token), // we have to pass min expected in case swaps slipped
        })),
        quote.option,
        zapHelpers
      );
      console.debug('fetchDepositStep::buildZap', bigNumberToStringDeep(buildZap));
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
      console.debug('fetchDepositStep::vaultDeposit', vaultDeposit);
      steps.push(vaultDeposit.zap);

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

  protected async buildWithdrawOptionsForAll(): Promise<BalancerWithdrawOption[]> {
    if (!this.allTokenOptions.length) {
      return [];
    }

    const type = 'all';
    const inputs = [this.vaultType.depositToken];

    const breakSelectionId = createSelectionId(this.vault.chainId, this.poolTokens);
    const breakOption: BalancerWithdrawOption = {
      id: createOptionId(this.id, this.vault.id, breakSelectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId: breakSelectionId,
      selectionOrder: SelectionOrder.AllTokensInPool,
      inputs,
      wantedOutputs: this.poolTokens,
      mode: TransactMode.Withdraw,
      strategyId,
      type,
      via: 'break-only',
      viaTokens: this.allTokenOptions,
    };

    const supportedAggregatorTokens = await this.aggregatorTokensCanSwapToAllOf(
      this.allTokenOptions
    );
    const aggregatorTokens = supportedAggregatorTokens
      .filter(token => !isTokenEqual(token, this.vaultType.depositToken))
      .map(token => ({ token }));

    const aggregatorOptions = aggregatorTokens.map(({ token }) => {
      const outputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, outputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, `${type}-aggregator`),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder:
          tokenInList(token, this.poolTokensincludingWrappedNative) ?
            SelectionOrder.TokenOfPool
          : SelectionOrder.Other,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        strategyId,
        type,
        via: 'aggregator',
        viaTokens: this.allTokenOptions,
      } as const satisfies BalancerWithdrawOption;
    });

    return [breakOption, ...aggregatorOptions];
  }

  protected async buildWithdrawOptionsForSingle(): Promise<BalancerWithdrawOption[]> {
    if (!this.singleTokenOptions.length) {
      return [];
    }

    const type = 'single';
    const inputs = [this.vaultType.depositToken];

    const baseOptions = this.singleTokenOptions.map(viaToken => {
      const outputs = [viaToken];
      const selectionId = createSelectionId(this.vault.chainId, outputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, `${type}-direct`),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.TokenOfPool,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        strategyId,
        type,
        via: 'direct',
        viaToken,
      } satisfies BalancerWithdrawOption;
    });

    const { inputTokens, inputTokenToWanted } = await this.aggregatorTokensCanSwapToTokens(
      this.singleTokenOptions
    );

    const aggregatorOptions = inputTokens.map(token => {
      const outputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, outputs);
      const viaTokens = inputTokenToWanted[token.address];

      if (viaTokens.length === 0) {
        console.error({ vault: this.vault.id, token, viaTokens });
        throw new Error(
          `No other tokens supported for ${token.symbol}; *** this should not happen ***`
        );
      }

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, `${type}-aggregator`),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder:
          tokenInList(token, this.poolTokensincludingWrappedNative) ?
            SelectionOrder.TokenOfPool
          : SelectionOrder.Other,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        strategyId,
        type,
        via: 'aggregator',
        viaTokens,
      } satisfies BalancerWithdrawOption;
    });

    return [...baseOptions, ...aggregatorOptions];
  }

  async fetchWithdrawOptions(): Promise<BalancerWithdrawOption[]> {
    const singleOptions = await this.buildWithdrawOptionsForSingle();
    const allOptions = await this.buildWithdrawOptionsForAll();
    return [...singleOptions, ...allOptions];
  }

  protected async quoteRemoveLiquidity(input: TokenAmount): Promise<{
    liquidity: TokenAmount;
    outputs: TokenAmount[];
  }> {
    const pool = this.getPool();
    const inputAmountWei = toWeiFromTokenAmount(input);
    const result = await pool.quoteRemoveLiquidity(inputAmountWei);

    return {
      liquidity: fromWeiToTokenAmount(result.liquidity, this.depositToken),
      outputs: result.outputs.map((amount, i) => fromWeiToTokenAmount(amount, this.poolTokens[i])),
    };
  }

  protected async quoteRemoveLiquidityOneToken(
    input: TokenAmount,
    wantedToken: TokenEntity
  ): Promise<{
    liquidity: TokenAmount;
    outputs: TokenAmount[];
  }> {
    const pool = this.getPool();
    if (!isBalancerSinglePool(pool)) {
      throw new Error('BalancerStrategy: Pool does not support removing liquidity to one token');
    }

    const inputAmountWei = toWeiFromTokenAmount(input);
    const result = await pool.quoteRemoveLiquidityOneToken(inputAmountWei, wantedToken.address);

    return {
      liquidity: fromWeiToTokenAmount(result.liquidity, this.depositToken),
      outputs: result.outputs.map((amount, i) => fromWeiToTokenAmount(amount, this.poolTokens[i])),
    };
  }

  protected async fetchWithdrawLiquidityAll(
    input: TokenAmount,
    _option: BalancerWithdrawOptionAllAggregator | BalancerWithdrawOptionAllBreakOnly
  ) {
    const result = await this.quoteRemoveLiquidity(input);
    return [
      {
        input,
        liquidity: {
          input,
          outputs: result.outputs,
        },
      },
    ];
  }

  protected async fetchWithdrawLiquiditySingleAggregator(
    input: TokenAmount,
    option: BalancerWithdrawOptionSingleAggregator
  ) {
    return await Promise.all(
      option.viaTokens.map(async token => {
        const result = await this.quoteRemoveLiquidityOneToken(input, token);
        return {
          input,
          liquidity: {
            input,
            outputs: result.outputs,
          },
        };
      })
    );
  }

  protected async fetchWithdrawLiquiditySingleDirect(
    input: TokenAmount,
    option: BalancerWithdrawOptionSingleDirect
  ) {
    const result = await this.quoteRemoveLiquidityOneToken(input, option.viaToken);
    return [
      {
        input,
        liquidity: {
          input,
          outputs: result.outputs,
        },
      },
    ];
  }

  protected async fetchWithdrawLiquiditySwaps(input: TokenAmount, option: BalancerWithdrawOption) {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const wantedOutput = option.wantedOutputs[0];
    const slippage = selectTransactSlippage(state);

    // Withdraw liquidity
    let breakSets: Array<{
      input: TokenAmount;
      liquidity: {
        input: TokenAmount;
        outputs: TokenAmount[];
      };
    }>;
    if (option.type === 'single' && option.via === 'aggregator') {
      breakSets = await this.fetchWithdrawLiquiditySingleAggregator(input, option);
    } else if (option.type === 'single' && option.via === 'direct') {
      breakSets = await this.fetchWithdrawLiquiditySingleDirect(input, option);
    } else if (option.type === 'all') {
      breakSets = await this.fetchWithdrawLiquidityAll(input, option);
    } else {
      // @ts-expect-error if all cases are handled
      throw new Error(`Unknown zap withdraw option type ${option.type} ${option.via}`);
    }

    if (option.type === 'all' && option.via === 'break-only') {
      return {
        ...breakSets[0],
        swaps: [],
        outputs: breakSets[0].liquidity.outputs,
      };
    }

    // Swap quotes
    const withSwaps = await Promise.all(
      breakSets.map(async ({ input, liquidity }) => {
        const quotes = await Promise.all(
          liquidity.outputs.map(async output => {
            if (output.amount.lte(BIG_ZERO) || isTokenEqual(output.token, wantedOutput)) {
              return undefined;
            }

            // we have to assume removing liquidity will slip 100% since we can't modify the call data later
            const minOutputAmount = slipBy(output.amount, slippage, output.token.decimals);
            const quotes = await swapAggregator.fetchQuotes(
              {
                vaultId: option.vaultId,
                fromToken: output.token,
                fromAmount: minOutputAmount,
                toToken: wantedOutput,
              },
              state,
              this.options.swap
            );
            const bestQuote = first(quotes);
            if (!bestQuote) {
              throw new Error(`No quote for ${output.token.symbol} to ${wantedOutput.symbol}`);
            }
            return bestQuote;
          })
        );

        const swaps = liquidity.outputs.map((output, i) => ({
          input: output,
          quote: quotes[i],
          output: quotes[i] ? { token: quotes[i].toToken, amount: quotes[i].toAmount } : output,
        }));

        return {
          input,
          liquidity,
          swaps,
          outputs: mergeTokenAmounts(swaps.map(s => s.output)),
        };
      })
    );

    // Most output
    const sorted = orderBy(withSwaps, s => totalValueOfTokenAmounts(s.outputs, state), 'desc');
    return sorted[0];
  }

  public async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: BalancerWithdrawOption
  ): Promise<BalancerWithdrawQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }
    const { zap, getState } = this.helpers;

    // Common: Withdraw from vault
    const state = getState();
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, this.vault, state);
    const liquidityWithdrawn = fromWeiToTokenAmount(withdrawnAmountAfterFeeWei, withdrawnToken);
    const returned: TokenAmount[] = [];

    // Common: Token Allowances
    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: zap.manager,
      },
    ];

    const { liquidity, swaps, outputs } = await this.fetchWithdrawLiquiditySwaps(
      liquidityWithdrawn,
      option
    );

    // Build quote steps
    const steps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        outputs: [liquidityWithdrawn],
      },
    ];

    steps.push({
      type: 'split',
      inputToken: liquidityWithdrawn.token,
      inputAmount: liquidityWithdrawn.amount,
      outputs: liquidity.outputs.filter(output => output.amount.gt(BIG_ZERO)),
    });

    for (const swap of swaps) {
      const { quote } = swap;
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
          quote: quote,
        });

        // We quoted the swap as if the liquidity slipped, so there might be some to return
        const withdrawnToken = liquidity.outputs.find(o => isTokenEqual(o.token, quote.fromToken));
        if (withdrawnToken) {
          const unused = withdrawnToken.amount.minus(quote.fromAmount);
          if (unused.gt(BIG_ZERO)) {
            returned.push({ token: withdrawnToken.token, amount: unused });
          }
        }
      }
    }

    if (returned.length > 0) {
      steps.push({
        type: 'unused',
        outputs: returned,
      });
    }

    const baseQuote: Omit<BalancerWithdrawQuote, 'type' | 'viaToken' | 'option'> = {
      id: createQuoteId(option.id),
      strategyId: this.id,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      inputs,
      allowances,
      fee: highestFeeOrZero(steps),
      steps,
      outputs,
      returned,
    };

    if (option.type === 'all') {
      return {
        type: 'all',
        option,
        ...baseQuote,
      };
    } else if (option.type === 'single') {
      const viaToken = option.via === 'direct' ? option.viaToken : swaps[0].input.token;
      if (!viaToken) {
        throw new Error('BalancerStrategy: No via token found for single withdraw');
      }
      return {
        type: 'single',
        viaToken,
        option,
        ...baseQuote,
      };
    } else {
      // @ts-expect-error if all cases are handled
      throw new Error(`Unknown zap withdraw option type ${option.type}`);
    }
  }

  protected async fetchZapSplitAll(
    inputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const input = onlyOneTokenAmount(inputs);
    const { outputs } = await this.quoteRemoveLiquidity(input);
    const pool = this.getPool();
    const minOutputs =
      pool.supportsFeature(BalancerFeature.RemoveSlippage) ?
        outputs.map(output => slipTokenAmountBy(output, slippage))
      : outputs;

    return {
      inputs,
      outputs,
      minOutputs,
      returned: [],
      zaps: [
        await pool.getRemoveLiquidityZap(
          toWeiFromTokenAmount(input),
          minOutputs.map(minOutput => toWeiFromTokenAmount(minOutput)),
          this.helpers.zap.router,
          true
        ),
      ],
    };
  }

  protected async fetchZapSplitOne(
    inputs: TokenAmount[],
    zapHelpers: ZapHelpers,
    viaToken: TokenEntity
  ): Promise<ZapStepResponse> {
    const pool = this.getPool();
    if (!isBalancerSinglePool(pool)) {
      throw new Error('BalancerStrategy: Pool does not support removing liquidity to one token');
    }

    const viaTokenIndex = this.poolTokens.findIndex(token => isTokenEqual(token, viaToken));
    if (viaTokenIndex < 0) {
      throw new Error('BalancerStrategy: viaToken not found in pool tokens');
    }

    const { slippage } = zapHelpers;
    const input = onlyOneTokenAmount(inputs);
    const { outputs } = await this.quoteRemoveLiquidityOneToken(input, viaToken);
    const minOutputs =
      pool.supportsFeature(BalancerFeature.RemoveSlippage) ?
        outputs.map(output => slipTokenAmountBy(output, slippage))
      : outputs;
    const minOutput = minOutputs[viaTokenIndex];
    if (!minOutput) {
      throw new Error('BalancerStrategy: viaToken not found in outputs');
    }

    return {
      inputs,
      outputs,
      minOutputs,
      returned: [],
      zaps: [
        await pool.getRemoveLiquidityOneTokenZap(
          toWeiFromTokenAmount(input),
          viaToken.address,
          toWeiFromTokenAmount(minOutput),
          this.helpers.zap.router,
          true
        ),
      ],
    };
  }

  protected async fetchZapSplit(
    quote: BalancerWithdrawQuote,
    inputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    if (quote.type === 'single') {
      return this.fetchZapSplitOne(inputs, zapHelpers, quote.viaToken);
    } else if (quote.type === 'all') {
      return this.fetchZapSplitAll(inputs, zapHelpers);
    } else {
      // @ts-expect-error if all cases are handled
      throw new Error(`Unknown zap split quote type ${quote.type}`);
    }
  }

  public async fetchWithdrawStep(
    quote: BalancerWithdrawQuote,
    t: TFunction<Namespace<string>>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = {
        slippage,
        state,
      };
      const withdrawQuote = quote.steps.find(isZapQuoteStepWithdraw);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const splitQuote = quote.steps.find(isZapQuoteStepSplit);

      if (!withdrawQuote || !splitQuote) {
        throw new Error('Withdraw quote missing withdraw or split step');
      }

      // Step 1. Withdraw from vault
      const vaultWithdraw = await this.vaultType.fetchZapWithdraw({
        inputs: quote.inputs,
        from: this.helpers.zap.router,
      });
      if (vaultWithdraw.outputs.length !== 1) {
        throw new Error('Withdraw output count mismatch');
      }

      const withdrawOutput = onlyOneTokenAmount(vaultWithdraw.outputs);
      if (!isTokenEqual(withdrawOutput.token, splitQuote.inputToken)) {
        throw new Error('Withdraw output token mismatch');
      }

      if (withdrawOutput.amount.lt(withdrawQuote.toAmount)) {
        throw new Error('Withdraw output amount mismatch');
      }

      const steps: ZapStep[] = [vaultWithdraw.zap];

      // Step 2. Split lp
      const splitZap = await this.fetchZapSplit(quote, [withdrawOutput], zapHelpers);
      splitZap.zaps.forEach(step => steps.push(step));

      // Step 3. Swaps
      // 0 swaps is valid when we break only
      if (swapQuotes.length > 0) {
        if (swapQuotes.length > splitZap.minOutputs.length) {
          throw new Error('More swap quotes than expected outputs');
        }

        const insertBalance = allTokensAreDistinct(
          swapQuotes.map(quoteStep => quoteStep.fromToken)
        );
        // On withdraw zap the last swap can use 100% of balance even if token was used in previous swaps (since there are no further steps)
        const lastSwapIndex = swapQuotes.length - 1;

        const swapZaps = await Promise.all(
          swapQuotes.map((quoteStep, i) => {
            const input = splitZap.minOutputs.find(o => isTokenEqual(o.token, quoteStep.fromToken));
            if (!input) {
              throw new Error('Swap input not found in split outputs');
            }
            return this.fetchZapSwap(quoteStep, zapHelpers, insertBalance || lastSwapIndex === i);
          })
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

  protected async aggregatorTokensCanSwapToAllOf(allTokens: TokenEntity[]): Promise<TokenEntity[]> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const tokenSupport = await swapAggregator.fetchTokenSupport(
      allTokens,
      this.vault.id,
      this.vault.chainId,
      state,
      this.options.swap
    );

    return tokenSupport.any.filter(aggToken => {
      return allTokens.every(
        (poolToken, i) =>
          isTokenEqual(aggToken, poolToken) ||
          tokenSupport.tokens[i].some(supportedToken => isTokenEqual(supportedToken, aggToken))
      );
    });
  }

  protected async aggregatorTokensCanSwapToTokens(tokens: TokenEntity[]): Promise<{
    inputTokens: TokenEntity[];
    inputTokenToWanted: Record<string, TokenEntity[]>;
  }> {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const tokenSupport = await swapAggregator.fetchTokenSupport(
      tokens,
      this.vault.id,
      this.vault.chainId,
      state,
      this.options.swap
    );

    const inputTokens = new Map<string, TokenEntity>();
    const inputTokenToWanted = tokens.reduce(
      (acc, wantedToken, i) => {
        for (const sourceToken of tokenSupport.tokens[i]) {
          if (isTokenEqual(sourceToken, wantedToken)) {
            continue;
          }
          acc[sourceToken.address] ??= [];
          acc[sourceToken.address].push(wantedToken);
          inputTokens.set(sourceToken.address, sourceToken);
        }

        return acc;
      },
      {} as Record<string, TokenEntity[]>
    );

    return { inputTokens: Array.from(inputTokens.values()), inputTokenToWanted };
  }
}

export const BalancerStrategy = BalancerStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
