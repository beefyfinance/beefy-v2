import BigNumber from 'bignumber.js';
import { first, uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
  fromWei,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number.ts';
import { tokenInList } from '../../../../../../helpers/tokens.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity, TokenErc20, TokenNative } from '../../../../entities/token.ts';
import { isTokenEqual, isTokenErc20 } from '../../../../entities/token.ts';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault.ts';
import { type AmmEntityGamma, isGammaAmm } from '../../../../entities/zap.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenById,
  selectTokenPriceByTokenOracleId,
} from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectVaultStrategyAddress } from '../../../../selectors/vaults.ts';
import { selectAmmById } from '../../../../selectors/zap.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { GammaPool } from '../../../amm/gamma/GammaPool.ts';
import type { IGammaPool } from '../../../amm/types.ts';
import { mergeTokenAmounts, slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyAssetCount,
  onlyOneInput,
  onlyOneToken,
  onlyOneTokenAmount,
} from '../../helpers/options.ts';
import {
  calculatePriceImpact,
  highestFeeOrZero,
  totalValueOfTokenAmounts,
  ZERO_FEE,
} from '../../helpers/quotes.ts';
import { allTokensAreDistinct, pickTokens, tokensToLp } from '../../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../../helpers/vault.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import type { QuoteRequest } from '../../swap/ISwapProvider.ts';
import {
  type GammaDepositOption,
  type GammaDepositQuote,
  type GammaWithdrawOption,
  type GammaWithdrawQuote,
  type InputTokenAmount,
  isZapQuoteStepBuild,
  isZapQuoteStepSplit,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepWithdraw,
  SelectionOrder,
  type TokenAmount,
  type ZapFee,
  type ZapQuoteStep,
  type ZapQuoteStepBuild,
  type ZapQuoteStepSplit,
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
import { QuoteChangedError } from '../error.ts';
import type { IZapStrategy, IZapStrategyStatic, ZapTransactHelpers } from '../IStrategy.ts';
import type { GammaStrategyConfig } from '../strategy-configs.ts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

type PartialWithdrawQuote = Pick<GammaWithdrawQuote, 'steps' | 'outputs' | 'fee' | 'returned'>;

const strategyId = 'gamma';
type StrategyId = typeof strategyId;

class GammaStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected readonly wnative: TokenErc20;
  protected readonly tokens: TokenEntity[];
  protected readonly lpTokens: TokenErc20[];
  protected readonly native: TokenNative;
  protected readonly amm: AmmEntityGamma;
  protected readonly pool: IGammaPool;
  protected readonly chain: ChainEntity;
  protected readonly depositToken: TokenEntity;
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;

  constructor(
    protected options: GammaStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    const { vault, vaultType, getState } = this.helpers;

    if (!isStandardVault(vault)) {
      throw new Error('Vault is not a standard vault');
    }
    if (!isStandardVaultType(vaultType)) {
      throw new Error('Vault type is not standard');
    }

    onlyAssetCount(vault, 2);

    const state = getState();
    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        throw new Error(`Vault ${vault.id}: Asset ${vault.assetIds[i]} not loaded`);
      }
    }

    const amm = selectAmmById(state, this.options.ammId);
    if (!amm) {
      throw new Error(`Gamma strategy: AMM ${this.options.ammId} not found`);
    }

    if (!isGammaAmm(amm)) {
      throw new Error(`Gamma strategy: AMM ${this.options.ammId} not gamma`);
    }

    this.vault = vault;
    this.vaultType = vaultType;
    this.amm = amm;
    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
    this.tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    this.lpTokens = tokensToLp(this.tokens, this.wnative);
    this.depositToken = vaultType.depositToken;
    this.chain = selectChainById(state, vault.chainId);
    this.pool = new GammaPool(this.depositToken.address, amm, this.chain);
  }

  public async beforeQuote(): Promise<void> {
    await this.pool.updateAllData();
  }

  public async beforeStep(): Promise<void> {
    await this.pool.updateAllData();
  }

  async fetchDepositOptions(): Promise<GammaDepositOption[]> {
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const outputs = [this.vaultType.depositToken];

    return supportedAggregatorTokens.map(token => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder:
          tokenInList(token, this.lpTokens) ? SelectionOrder.TokenOfPool : SelectionOrder.Other,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId: 'gamma',
        depositToken: this.vaultType.depositToken,
        lpTokens: this.lpTokens,
        swapVia: 'aggregator',
      };
    });
  }

  async getDepositRatio(
    state: BeefyState,
    inputToken: TokenEntity,
    inputAmount: BigNumber
  ): Promise<BigNumber> {
    const [token0] = this.lpTokens;
    const roughInputPrice = selectTokenPriceByTokenOracleId(state, inputToken.oracleId);
    const roughTokenPrices = this.lpTokens.map(token =>
      selectTokenPriceByTokenOracleId(state, token.oracleId)
    );
    const testTokenAmounts = this.lpTokens.map((token, i) => ({
      token,
      amount: inputAmount
        .dividedBy(2)
        .times(roughInputPrice)
        .dividedBy(roughTokenPrices[i])
        .decimalPlaces(token0.decimals, BigNumber.ROUND_FLOOR),
    }));

    return await this.pool.getAddLiquidityRatio(testTokenAmounts);
  }

  /**
   * We call this liquidity, but its really shares of the Gamma pool, we use liquidity to not confuse it with vault shares
   */
  async quoteAddLiquidity(
    depositToken: TokenEntity,
    inputs: TokenAmount[]
  ): Promise<{
    liquidity: TokenAmount;
    used: TokenAmount[];
    unused: TokenAmount[];
  }> {
    const { priceRatio, totalAmounts, totalSupply } = this.pool.getHypervisorData();
    const optimal = await this.pool.getOptimalAddLiquidity(inputs);
    if (!optimal.every(({ amount }, i) => amount.lte(inputs[i].amount))) {
      console.debug('quoteAddLiquidity', bigNumberToStringDeep({ inputs, optimal }));
      throw new Error('Gamma strategy: quoteAddLiquidity: optimal liquidity is greater than input');
    }

    const [deposit0, deposit1] = optimal.map(input => toWei(input.amount, input.token.decimals));
    const deposit0PricedInToken1 = deposit0.multipliedBy(priceRatio);

    let shares = deposit1.plus(deposit0PricedInToken1);

    if (totalSupply.gt(0)) {
      const [pool0, pool1] = totalAmounts;
      const pool0PricedInToken1 = pool0.multipliedBy(priceRatio);
      shares = shares.multipliedBy(totalSupply).dividedBy(pool1.plus(pool0PricedInToken1));
    }

    return {
      liquidity: { token: depositToken, amount: fromWei(shares, depositToken.decimals) },
      used: optimal,
      unused: inputs.map((input, i) => ({
        token: input.token,
        amount: input.amount.minus(optimal[i].amount),
      })),
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: GammaDepositOption
  ): Promise<GammaDepositQuote> {
    const { zap, swapAggregator, getState } = this.helpers;
    const { lpTokens, depositToken } = option;
    const state = getState();
    const slippage = selectTransactSlippage(state);
    const input = onlyOneInput(inputs);

    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Gamma strategy: Quote called with 0 input amount');
    }

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

    // How much input to swap to each lp token?
    const swapRatio = await this.getDepositRatio(state, input.token, input.amount);

    const swapInAmount0 = input.amount
      .multipliedBy(swapRatio)
      .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR);
    const swapInAmount1 = input.amount
      .minus(swapInAmount0)
      .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR);
    const swapInAmounts = [swapInAmount0, swapInAmount1];
    console.log(bigNumberToStringDeep({ swapRatio, swapInAmount0, swapInAmount1 }));

    // Swap quotes
    // Skip swaps if input token is one of the lp tokens, or if position is out of range, and we need to swap 0 of that token
    const quoteRequestsPerLpToken: (QuoteRequest | undefined)[] = lpTokens.map((lpTokenN, i) =>
      isTokenEqual(lpTokenN, input.token) || swapInAmounts[i].lte(BIG_ZERO) ?
        undefined
      : {
          vaultId: this.vault.id,
          fromToken: input.token,
          fromAmount: swapInAmounts[i],
          toToken: lpTokenN,
        }
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
    const minLpTokenAmounts = quotePerLpToken.map((quote, i) => {
      if (quote) {
        return {
          token: quote.toToken,
          amount: slipBy(quote.toAmount, slippage, quote.toToken.decimals),
        };
      }
      return { token: lpTokens[i], amount: swapInAmounts[i] };
    });

    const { liquidity, used, unused } = await this.quoteAddLiquidity(
      depositToken,
      minLpTokenAmounts
    );

    console.log(bigNumberToStringDeep({ liquidity, used, unused }));

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
      inputs: used, // technically its `used` - was lpTokenAmounts
      outputToken: depositToken,
      outputAmount: liquidity.amount,
      providerId: 'gamma', // we use gamma here rather than real underlying provider (uniswap etc.)
    });

    steps.push({
      type: 'deposit',
      inputs: [
        {
          token: depositToken,
          amount: liquidity.amount,
        },
      ],
    });

    // Build quote outputs
    const outputs: TokenAmount[] = [
      {
        token: depositToken,
        amount: liquidity.amount,
      },
    ];

    // Unused amounts
    const returned: TokenAmount[] = lpTokenAmounts
      .map(({ token, amount }, i) => ({
        token,
        amount: amount.minus(minLpTokenAmounts[i].amount).plus(unused[i].amount),
      }))
      .filter(({ amount }) => amount.gt(BIG_ZERO));

    if (returned.length > 0) {
      steps.push({
        type: 'unused',
        outputs: returned,
      });
    }

    // Build quote
    return {
      id: createQuoteId(option.id),
      strategyId: 'gamma',
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
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage } = zapHelpers;
    const { liquidity, used, unused } = await this.quoteAddLiquidity(
      this.vaultType.depositToken,
      minInputs
    );

    console.log(bigNumberToStringDeep({ liquidity, used, unused }));

    return this.pool.getZapAddLiquidity({
      inputs: used,
      outputs: [{ token: this.vaultType.depositToken, amount: liquidity.amount }],
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: false,
    });
  }

  async fetchDepositStep(quote: GammaDepositQuote, t: TFunction<Namespace>): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };
      const steps: ZapStep[] = [];
      const minBalances = new Balances(quote.inputs);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const buildQuote = quote.steps.find(isZapQuoteStepBuild);

      if (!buildQuote || !swapQuotes.length) {
        throw new Error('Invalid deposit quote');
      }

      // Swaps
      if (swapQuotes.length === 0 || swapQuotes.length > 2) {
        throw new Error('Invalid swap quote');
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
        console.debug('swapZaps', bigNumberToStringDeep(swapZaps));
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
      console.debug('buildZap', bigNumberToStringDeep(buildZap));
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

  async fetchWithdrawOptions(): Promise<GammaWithdrawOption[]> {
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const inputs = [this.vaultType.depositToken];

    const breakSelectionId = createSelectionId(this.vault.chainId, this.lpTokens);
    const breakOption: GammaWithdrawOption = {
      id: createOptionId(this.id, this.vault.id, breakSelectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId: breakSelectionId,
      selectionOrder: SelectionOrder.AllTokensInPool,
      inputs,
      wantedOutputs: this.lpTokens,
      mode: TransactMode.Withdraw,
      strategyId: 'gamma',
      depositToken: this.vaultType.depositToken,
      lpTokens: this.lpTokens,
    };

    return [breakOption].concat(
      supportedAggregatorTokens.map(token => {
        const outputs = [token];
        const selectionId = createSelectionId(this.vault.chainId, outputs);

        return {
          id: createOptionId(this.id, this.vault.id, selectionId),
          vaultId: this.vault.id,
          chainId: this.vault.chainId,
          selectionId,
          selectionOrder:
            tokenInList(token, this.lpTokens) ? SelectionOrder.TokenOfPool : SelectionOrder.Other,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Withdraw,
          strategyId: 'gamma',
          depositToken: this.vaultType.depositToken,
          lpTokens: this.lpTokens,
          swapVia: 'aggregator',
        };
      })
    );
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: GammaWithdrawOption
  ): Promise<GammaWithdrawQuote> {
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

    // Common: Break LP
    const strategyAddress = selectVaultStrategyAddress(state, this.vault.id);
    const tokenHolders: [string, ...string[]] =
      this.options.tokenHolder ? [this.options.tokenHolder, strategyAddress] : [strategyAddress];
    const [amount0, amount1] = await this.pool.quoteRemoveLiquidity(
      withdrawnAmountAfterFeeWei,
      tokenHolders
    );
    const breakReturned: TokenAmount[] = [];
    const breakOutputs: TokenAmount[] = [
      { token: this.lpTokens[0], amount: fromWei(amount0, this.lpTokens[0].decimals) },
      { token: this.lpTokens[1], amount: fromWei(amount1, this.lpTokens[1].decimals) },
    ];

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

    if (option.swapVia === 'aggregator') {
      // swap via aggregator
      ({ outputs, returned, steps, fee } = await this.fetchWithdrawQuoteAggregator(
        option,
        breakOutputs,
        breakReturned,
        breakSteps
      ));
    } else {
      // break only
      outputs = breakOutputs;
      steps = breakSteps;
      returned = breakReturned;
      fee = ZERO_FEE;
    }

    if (returned.length > 0) {
      steps.push({
        type: 'unused',
        outputs: returned,
      });
    }

    // return break only
    return {
      id: createQuoteId(option.id),
      strategyId: 'gamma',
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

  async fetchWithdrawQuoteAggregator(
    option: GammaWithdrawOption,
    breakOutputs: TokenAmount[],
    breakReturned: TokenAmount[],
    steps: ZapQuoteStep[]
  ): Promise<PartialWithdrawQuote> {
    const { wantedOutputs } = option;
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const slippage = selectTransactSlippage(state);
    const wantedOutput = onlyOneToken(wantedOutputs);
    const needsSwap = breakOutputs.map(
      tokenAmount =>
        !isTokenEqual(wantedOutput, tokenAmount.token) && tokenAmount.amount.gt(BIG_ZERO)
    );

    const swapQuotes = await Promise.all(
      breakOutputs.map(async (input, i) => {
        if (needsSwap[i]) {
          const quotes = await swapAggregator.fetchQuotes(
            {
              fromAmount: slipBy(input.amount, slippage, input.token.decimals), // we have to assume it will slip 100% since we can't modify the call data later
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
    const unused: TokenAmount[] = [];

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

        if (swapQuote.fromAmount.lt(breakOutputs[i].amount)) {
          unused.push({
            token: input.token,
            amount: breakOutputs[i].amount.minus(swapQuote.fromAmount),
          });
        }
      } else {
        outputTotal = outputTotal.plus(input.amount);
      }
    });

    const outputs: TokenAmount[] = [{ token: wantedOutput, amount: outputTotal }];

    return {
      outputs,
      returned: mergeTokenAmounts(breakReturned, unused),
      steps,
      fee: highestFeeOrZero(steps),
    };
  }

  protected async fetchZapSplit(
    quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap, getState } = this.helpers;
    const { slippage } = zapHelpers;
    const state = getState();

    const strategyAddress = selectVaultStrategyAddress(state, this.vault.id);
    const tokenHolders: [string, ...string[]] =
      this.options.tokenHolder ? [this.options.tokenHolder, strategyAddress] : [strategyAddress];
    const withdrawnAmountAfterFeeWei = toWei(inputs[0].amount, inputs[0].token.decimals);
    const [amount0, amount1] = await this.pool.quoteRemoveLiquidity(
      withdrawnAmountAfterFeeWei,
      tokenHolders
    );

    const quoteIndexes = this.lpTokens.map(token =>
      quoteStep.outputs.findIndex(output => isTokenEqual(output.token, token))
    );

    const outputs = [amount0, amount1].map((amount, i) => {
      if (quoteIndexes[i] === -1) {
        throw new Error('Invalid output token');
      }

      const quoteOutput = quoteStep.outputs[quoteIndexes[i]];
      const token = quoteOutput.token;
      const amountOut = fromWei(amount, token.decimals);

      return {
        token,
        amount: amountOut,
      };
    });

    // We need some leeway or we will get stuck in a quote-requote loop (also our prices aren't 100% accurate)
    const originalValue = totalValueOfTokenAmounts(quoteStep.outputs, state);
    const minAllowed = originalValue.multipliedBy(1 - slippage / 10); // 10% of slippage% (1% -> 0.1%)
    const nowValue = totalValueOfTokenAmounts(outputs, state);
    if (nowValue.lt(minAllowed)) {
      console.debug('fetchZapSplit', {
        quote: originalValue.toString(10),
        now: nowValue.toString(10),
        nowMin: minAllowed.toString(10),
      });
      throw new QuoteChangedError(
        'Expected output changed between quote and transaction when breaking LP.'
      );
    }

    return await this.pool.getZapRemoveLiquidity({
      inputs: inputs,
      outputs: outputs,
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  public async fetchWithdrawStep(
    quote: GammaWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };
      const withdrawQuote = quote.steps.find(isZapQuoteStepWithdraw);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const splitQuote = quote.steps.find(isZapQuoteStepSplit);

      if (!withdrawQuote || !splitQuote) {
        throw new Error('Withdraw or split zap quote not found');
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

  protected async aggregatorTokenSupport() {
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
}

export const GammaStrategy = GammaStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
