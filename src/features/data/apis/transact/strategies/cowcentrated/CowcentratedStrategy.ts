import BigNumber from 'bignumber.js';
import { first, uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { type Abi, encodeFunctionData } from 'viem';
import {
  BIG_ZERO,
  bigNumberToBigInt,
  fromWei,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import { isTokenEqual, isTokenErc20, isTokenNative } from '../../../../entities/token.ts';
import { isCowcentratedVault, type VaultCowcentrated } from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../../selectors/chains.ts';
import { selectTokenPriceByAddress } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectVaultStrategyAddress } from '../../../../selectors/vaults.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { BeefyCLMPool } from '../../../beefy/beefy-clm-pool.ts';
import { mergeTokenAmounts, slipAllBy, slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
  onlyOneToken,
} from '../../helpers/options.ts';
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes.ts';
import { allTokensAreDistinct, pickTokens } from '../../helpers/tokens.ts';
import { getInsertIndex, getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import type { QuoteRequest } from '../../swap/ISwapProvider.ts';
import {
  type CowcentratedZapDepositOption,
  type CowcentratedZapDepositQuote,
  type CowcentratedZapWithdrawOption,
  type CowcentratedZapWithdrawQuote,
  type InputTokenAmount,
  isCowcentratedWithdrawQuote,
  isZapQuoteStepDeposit,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  SelectionOrder,
  type TokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepDeposit,
  type ZapQuoteStepSwap,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types.ts';
import { type ICowcentratedVaultType, isCowcentratedVaultType } from '../../vaults/IVaultType.ts';
import { fetchZapAggregatorSwap } from '../../zap/swap.ts';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepRequest,
  ZapStepResponse,
} from '../../zap/types.ts';
import { QuoteCowcentratedNoSingleSideError, QuoteCowcentratedNotCalmError } from '../error.ts';
import type {
  IComposableStrategy,
  IComposableStrategyStatic,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { CowcentratedStrategyConfig } from '../strategy-configs.ts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
  clmPool: BeefyCLMPool;
};

const strategyId = 'cowcentrated';
type StrategyId = typeof strategyId;

class CowcentratedStrategyImpl implements IComposableStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composable = true;
  public readonly id = strategyId;

  protected readonly vault: VaultCowcentrated;
  protected readonly vaultType: ICowcentratedVaultType;

  constructor(
    protected options: CowcentratedStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    const { vault, vaultType } = this.helpers;
    if (!isCowcentratedVault(vault)) {
      throw new Error('Vault is not a cowcentrated vault');
    }
    if (!isCowcentratedVaultType(vaultType)) {
      throw new Error('Vault type is not cowcentrated');
    }
    this.vault = vault;
    this.vaultType = vaultType;
  }

  getHelpers(): ZapTransactHelpers {
    return this.helpers;
  }

  async fetchDepositOptions(): Promise<CowcentratedZapDepositOption[]> {
    // what tokens we can zap via swap aggregator with
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const zapTokens = supportedAggregatorTokens.map(token => ({
      token,
      swap: 'aggregator' as const,
    }));

    return zapTokens.map(({ token, swap }) => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, swap),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.Other,
        inputs,
        wantedOutputs: this.vaultType.depositTokens,
        mode: TransactMode.Deposit,
        strategyId: this.id,
        depositToken: this.vaultType.shareToken,
        lpTokens: this.vaultType.depositTokens,
        vaultType: 'cowcentrated',
        swapVia: swap,
      };
    });
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedZapDepositOption
  ): Promise<CowcentratedZapDepositQuote> {
    const input = onlyOneInput(inputs);

    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Cowcentrated strategy: Quote called with 0 input amount');
    }

    if (option.swapVia === 'aggregator') {
      return this.fetchDepositQuoteAggregator(input, option);
    } else {
      throw new Error('Cowcentrated strategy: Unsupported swap method');
    }
  }

  async fetchDepositUserlessZapBreakdown(
    quote: CowcentratedZapDepositQuote
  ): Promise<UserlessZapDepositBreakdown> {
    const state = this.helpers.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const clmPool = new BeefyCLMPool(
      this.vault.contractAddress,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.vaultType.depositTokens
    );
    const slippage = selectTransactSlippage(state);
    const zapHelpers: ZapHelpers = { chain, slippage, state, clmPool };
    const steps: ZapStep[] = [];
    const minBalances = new Balances(quote.inputs);
    const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
    const depositQuote = quote.steps.find(isZapQuoteStepDeposit);

    if (!depositQuote || swapQuotes.length > 2) {
      throw new Error('Invalid quote');
    }

    // Swaps
    const insertBalance = allTokensAreDistinct(
      swapQuotes
        .map(quoteStep => quoteStep.fromToken)
        .concat(depositQuote.inputs.map(({ token }) => token))
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

    // Deposit
    const depositZap = await this.fetchZapDepositCLM(
      depositQuote,
      depositQuote.inputs.map(({ token }) => ({
        token,
        amount: minBalances.get(token), // we have to pass min expected in case swaps slipped
      })),
      zapHelpers
    );
    depositZap.zaps.forEach(step => steps.push(step));
    minBalances.subtractMany(depositZap.inputs);
    minBalances.addMany(depositZap.minOutputs);

    // Build order
    const inputs: OrderInput[] = quote.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));

    const requiredOutputs: OrderOutput[] = depositZap.outputs.map(output => ({
      token: getTokenAddress(output.token),
      minOutputAmount: toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      ),
    }));

    // We need to list all inputs, and mid-route outputs, as outputs so dust gets returned
    const dustOutputs: OrderOutput[] = pickTokens(quote.outputs, quote.inputs, quote.returned).map(
      token => ({
        token: getTokenAddress(token),
        minOutputAmount: '0',
      })
    );

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

    return {
      zapRequest,
      expectedTokens: depositZap.outputs.map(output => output.token),
      minBalances,
    };
  }

  async fetchDepositStep(
    quote: CowcentratedZapDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.fetchDepositUserlessZapBreakdown(quote);

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

  async fetchWithdrawOptions(): Promise<CowcentratedZapWithdrawOption[]> {
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const aggregatorTokens = supportedAggregatorTokens.map(token => ({
      token,
      swap: 'aggregator' as const,
    }));

    const zapTokens = aggregatorTokens;
    const inputs = [this.vaultType.shareToken];

    return zapTokens.map(({ token, swap }) => {
      const outputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, outputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, swap),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.Other,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        depositToken: this.vaultType.shareToken,
        swapVia: swap,
        strategyId: 'cowcentrated',
        vaultType: 'cowcentrated',
      };
    });
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedZapWithdrawOption
  ): Promise<CowcentratedZapWithdrawQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    const { zap, getState } = this.helpers;
    const state = getState();

    // Common: Token Allowances
    const allowances = [
      {
        token: this.vaultType.shareToken,
        amount: input.amount,
        spenderAddress: zap.manager,
      },
    ];

    // Common: Withdraw as token0/1
    const vaultWithdrawn = await this.vaultType.fetchWithdrawQuote(inputs, option);
    if (!isCowcentratedWithdrawQuote(vaultWithdrawn)) {
      throw new Error('Invalid withdraw quote');
    }
    if (!vaultWithdrawn.isCalm) {
      throw new QuoteCowcentratedNotCalmError('withdraw');
    }

    const withdrawSteps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        outputs: vaultWithdrawn.outputs,
      },
    ];

    const { outputs, returned, steps, fee } = await this.fetchWithdrawQuoteAggregator(
      option,
      vaultWithdrawn.outputs,
      [],
      withdrawSteps
    );

    if (returned.length > 0) {
      steps.push({
        type: 'unused',
        outputs: returned,
      });
    }

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
      isCalm: vaultWithdrawn.isCalm,
      vaultType: vaultWithdrawn.vaultType,
    };
  }

  async fetchWithdrawUserlessZapBreakdown(
    quote: CowcentratedZapWithdrawQuote
  ): Promise<UserlessZapWithdrawBreakdown> {
    const state = this.helpers.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const clmPool = new BeefyCLMPool(
      this.vaultType.shareToken.address,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.vaultType.depositTokens
    );
    const slippage = selectTransactSlippage(state);
    const zapHelpers: ZapHelpers = { chain, slippage, state, clmPool };
    const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
    const steps: ZapStep[] = [];

    // Step 1: Withdraw from CLM
    const vaultWithdrawn = await this.vaultType.fetchZapWithdraw({
      inputs: quote.inputs,
      from: this.helpers.zap.router,
    });
    steps.push(vaultWithdrawn.zap);

    // Step 2: Swap(s)
    // (0 steps are allowed if wanted token is one of the LP tokens and 0 of the other token is split)
    if (swapQuotes.length > 2) {
      throw new Error('Invalid withdraw quote: too many swap steps');
    }

    if (swapQuotes.length > 0) {
      const insertBalance = allTokensAreDistinct(swapQuotes.map(quoteStep => quoteStep.fromToken));

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
    const inputs: OrderInput[] = quote.inputs.map(input => ({
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
    const dustOutputs: OrderOutput[] = pickTokens(quote.outputs, quote.inputs, quote.returned).map(
      token => ({
        token: getTokenAddress(token),
        minOutputAmount: '0',
      })
    );

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

    return {
      zapRequest,
      expectedTokens,
    };
  }

  async fetchWithdrawStep(
    quote: CowcentratedZapWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.fetchWithdrawUserlessZapBreakdown(quote);

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

  async aggregatorTokenSupport() {
    const { swapAggregator, getState } = this.helpers;
    const depositTokens = this.vaultType.depositTokens;
    const state = getState();
    const tokenSupport = await swapAggregator.fetchTokenSupport(
      depositTokens,
      this.vault.id,
      this.vault.chainId,
      state,
      this.options.swap
    );

    return tokenSupport.any.filter(token => {
      return depositTokens.every(
        (lpToken, i) =>
          isTokenEqual(token, lpToken) ||
          tokenSupport.tokens[i].some(supportedToken => isTokenEqual(supportedToken, token))
      );
    });
  }

  protected async fetchDepositQuoteAggregator(
    input: InputTokenAmount,
    option: CowcentratedZapDepositOption
  ): Promise<CowcentratedZapDepositQuote> {
    const { getState, zap, swapAggregator } = this.helpers;
    const state = getState();
    const strategy = selectVaultStrategyAddress(state, this.vault.id);
    const chain = selectChainById(state, this.vault.chainId);
    const clmPool = new BeefyCLMPool(
      this.vault.contractAddress,
      strategy,
      chain,
      this.vaultType.depositTokens
    );

    // We want to be able to convert to token1
    const inputPrice = selectTokenPriceByAddress(state, chain.id, input.token.address);
    const token1Price = selectTokenPriceByAddress(
      state,
      chain.id,
      this.vaultType.depositTokens[1].address
    );
    const ratios = await clmPool.getDepositRatioData(input, inputPrice, token1Price);

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
    const swapInAmount0 = input.amount
      .times(ratios[0])
      .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR);
    const swapInAmounts = [swapInAmount0, input.amount.minus(swapInAmount0)];

    // Swap quotes
    const quoteRequestsPerLpToken: (QuoteRequest | undefined)[] = this.vaultType.depositTokens.map(
      (lpTokenN, i) =>
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
      return { token: this.vaultType.depositTokens[i], amount: swapInAmounts[i] };
    });

    const { isCalm, liquidity, used0, used1, unused0, unused1, position1, position0 } =
      await clmPool.previewDeposit(lpTokenAmounts[0].amount, lpTokenAmounts[1].amount);

    if (liquidity.lte(BIG_ZERO)) {
      throw new QuoteCowcentratedNoSingleSideError(lpTokenAmounts);
    }

    if (!isCalm) {
      throw new QuoteCowcentratedNotCalmError('deposit');
    }

    const depositUsed = [used0, used1].map((amount, i) => ({
      token: this.vaultType.depositTokens[i],
      amount: fromWei(amount, this.vaultType.depositTokens[i].decimals),
    }));
    const depositUnused = [unused0, unused1].map((amount, i) => ({
      token: this.vaultType.depositTokens[i],
      amount: fromWei(amount, this.vaultType.depositTokens[i].decimals),
    }));
    const depositPosition = [position0, position1].map((amount, i) => ({
      token: this.vaultType.depositTokens[i],
      amount: fromWei(amount, this.vaultType.depositTokens[i].decimals),
    }));

    // build quote inputs
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
      type: 'deposit',
      inputs: depositUsed,
    });

    const outputs: TokenAmount[] = [
      {
        token: this.vaultType.shareToken,
        amount: fromWei(liquidity, this.vaultType.shareToken.decimals),
      },
    ];
    const returned: TokenAmount[] = depositUnused.filter(({ amount }) => amount.gt(BIG_ZERO));

    if (returned.length) {
      steps.push({
        type: 'unused',
        outputs: returned,
      });
    }

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
      vaultType: 'cowcentrated',
      isCalm,
      unused: depositUnused,
      used: depositUsed,
      position: depositPosition,
    };
  }

  protected async fetchWithdrawQuoteAggregator(
    option: CowcentratedZapWithdrawOption,
    breakOutputs: TokenAmount[],
    breakReturned: TokenAmount[],
    steps: ZapQuoteStep[]
  ) {
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
              fromAmount: slipBy(input.amount, slippage, input.token.decimals),
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

    let outputTotal = BIG_ZERO;
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
          fromAmount: swapQuote.fromAmount,
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

  protected async fetchZapDepositCLM(
    _quoteStep: ZapQuoteStepDeposit,
    minInputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage, clmPool } = zapHelpers;

    const {
      liquidity: liquidityWei,
      used1,
      used0,
    } = await clmPool.previewDeposit(minInputs[0].amount, minInputs[1].amount);

    const liquidity = fromWei(liquidityWei, this.vaultType.shareToken.decimals);
    const addAmounts = [used0, used1].map((amount, i) => ({
      token: minInputs[i].token,
      amount: fromWei(amount, minInputs[i].token.decimals),
    }));

    return await this.getZapBuildCLM({
      inputs: addAmounts,
      outputs: [{ token: this.vaultType.shareToken, amount: liquidity }],
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  protected async getZapBuildCLM(request: ZapStepRequest): Promise<ZapStepResponse> {
    const { inputs, outputs, maxSlippage, insertBalance } = request;

    if (inputs.length !== 2) {
      throw new Error('Invalid inputs');
    }

    for (const input of inputs) {
      if (isTokenNative(input.token)) {
        throw new Error('Invalid token');
      }
      if (!this.vaultType.depositTokens.find(token => isTokenEqual(token, input.token))) {
        throw new Error('Invalid token');
      }
    }

    return {
      inputs,
      outputs,
      minOutputs: slipAllBy(outputs, maxSlippage),
      returned: [],
      zaps: [
        this.buildZapbuildCLMTx(
          this.vaultType.shareToken.address,
          toWei(inputs[0].amount, inputs[0].token.decimals),
          toWei(inputs[1].amount, inputs[1].token.decimals),
          toWei(
            slipBy(outputs[0].amount, maxSlippage, outputs[0].token.decimals),
            outputs[0].token.decimals
          ),
          inputs[0].token.address,
          inputs[1].token.address,
          insertBalance
        ),
      ],
    };
  }

  protected buildZapbuildCLMTx(
    clmAddress: string,
    amountA: BigNumber,
    amountB: BigNumber,
    liquidity: BigNumber,
    tokenA: string,
    tokenB: string,
    insertBalance: boolean
  ): ZapStep {
    return {
      target: clmAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'deposit',
            constant: false,
            payable: false,
            inputs: [
              {
                name: '_amount0',
                type: 'uint256',
              },
              {
                name: '_amount1',
                type: 'uint256',
              },
              {
                name: '_minShares',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            outputs: [],
          },
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(amountA),
          bigNumberToBigInt(amountB),
          bigNumberToBigInt(liquidity),
        ],
      }),
      tokens: [
        {
          token: tokenA,
          index: insertBalance ? getInsertIndex(0) : -1, // amountADesired
        },
        {
          token: tokenB,
          index: insertBalance ? getInsertIndex(1) : -1, // amountBDesired
        },
      ],
    };
  }
}

export const CowcentratedStrategy =
  CowcentratedStrategyImpl satisfies IComposableStrategyStatic<StrategyId>;
