import type { CowcentratedStrategyOptions, IStrategy, ZapTransactHelpers } from '../IStrategy';
import {
  isZapQuoteStepSwap,
  type CowcentratedDepositOption,
  type CowcentratedVaultDepositQuote,
  type DepositOption,
  type DepositQuote,
  type InputTokenAmount,
  type TokenAmount,
  type WithdrawOption,
  type WithdrawQuote,
  type ZapQuoteStep,
  isZapQuoteStepBuild,
  type ZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  type ZapQuoteStepSwapAggregator,
  type ZapQuoteStepBuild,
  type CowcentratedWithdrawOption,
  isZapQuoteStepSplit,
  type CowcentratedVaultWithdrawQuote,
  type ZapQuoteStepSplit,
} from '../../transact-types';
import type { Step } from '../../../../reducers/wallet/stepper';
import type { Namespace, TFunction } from 'react-i18next';
import type { CowcentratedVaultType } from '../../vaults/CowcentratedVaultType';
import { isTokenEqual, isTokenErc20, isTokenNative } from '../../../../entities/token';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
  onlyOneToken,
  onlyOneTokenAmount,
} from '../../helpers/options';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
  fromWei,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number';
import { selectChainById } from '../../../../selectors/chains';
import { selectVaultStrategyAddress } from '../../../../selectors/vaults';
import { BeefyCLMPool } from '../../../beefy/beefy-clm-pool';
import { selectTokenPriceByAddress } from '../../../../selectors/tokens';
import type { QuoteRequest } from '../../swap/ISwapProvider';
import { first, uniqBy } from 'lodash-es';
import { ZERO_FEE, calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import { selectTransactSlippage } from '../../../../selectors/transact';
import type { ChainEntity } from '../../../../entities/chain';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepRequest,
  ZapStepResponse,
} from '../../zap/types';
import { Balances } from '../../helpers/Balances';
import { allTokensAreDistinct, pickTokens } from '../../helpers/tokens';
import { fetchZapAggregatorSwap } from '../../zap/swap';
import { NO_RELAY, getInsertIndex, getTokenAddress } from '../../helpers/zap';
import abiCoder from 'web3-eth-abi';
import { slipAllBy, slipBy } from '../../helpers/amounts';
import { walletActions } from '../../../../actions/wallet-actions';
import type BigNumber from 'bignumber.js';
import { isCowcentratedLiquidityVault } from '../../../../entities/vault';
import { QuoteChangedError } from '../errors';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
  clmPool: BeefyCLMPool;
};

/**
 * This is just a wrapper around IVaultType to make it an IStrategy
 */
// export class CowcentratedStrategy<T extends ICowcentratedVaultType> implements IStrategy {
export class CowcentratedStrategy<TOptions extends CowcentratedStrategyOptions>
  implements IStrategy
{
  public readonly id = 'cowcentrated';

  constructor(protected options: TOptions, protected helpers: ZapTransactHelpers) {}

  async fetchDepositOptions(): Promise<DepositOption[]> {
    const { vault, vaultType } = this.helpers;

    const clmVaultType = vaultType as CowcentratedVaultType;

    // what tokens we can zap via swap aggregator with
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const zapTokens = supportedAggregatorTokens.map(token => ({
      token,
      swap: 'aggregator' as const,
    }));

    return zapTokens.map(({ token, swap }) => {
      const inputs = [token];
      const selectionId = createSelectionId(vault.chainId, inputs);

      return {
        id: createOptionId(this.id, vault.id, selectionId, swap),
        vaultId: vault.id,
        chainId: vault.chainId,
        selectionId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: [clmVaultType.depositToken],
        mode: TransactMode.Deposit,
        strategyId: this.id,
        depositToken: clmVaultType.depositToken,
        lpTokens: (vaultType as CowcentratedVaultType).depositTokens,
        vaultType: 'cowcentrated',
        swapVia: 'aggregator',
      };
    });
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedDepositOption
  ): Promise<DepositQuote> {
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

  async fetchDepositStep(
    quote: CowcentratedVaultDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { vault } = this.helpers;
    const vaultType = this.helpers.vaultType as CowcentratedVaultType;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, vault.chainId);
      const clmPool = new BeefyCLMPool(
        vault.earnContractAddress,
        selectVaultStrategyAddress(state, vault.id),
        chain,
        vaultType.depositTokens
      );
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state, clmPool };
      const steps: ZapStep[] = [];
      const minBalances = new Balances(quote.inputs);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const buildQuote = quote.steps.find(isZapQuoteStepBuild);

      if (!buildQuote || swapQuotes.length > 2) {
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
      const buildZap = await this.fetchZapBuildCLM(
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

      // Build order
      const inputs: OrderInput[] = quote.inputs.map(input => ({
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      }));

      const requiredOutputs: OrderOutput[] = buildZap.outputs.map(output => ({
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
      // dustOutputs.push({
      //   token: getTokenAddress(buildQuote.outputToken),
      //   minOutputAmount: '0',
      // });

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

      const expectedTokens = buildZap.outputs.map(output => output.token);
      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens
      );

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

  async fetchWithdrawOptions(): Promise<WithdrawOption[]> {
    const { vault, vaultType } = this.helpers;
    // const clmVault = vaultType as CowcentratedVaultType;

    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const aggregatorTokens = supportedAggregatorTokens.map(token => ({
      token,
      swap: 'aggregator' as const,
    }));

    const zapTokens = aggregatorTokens;
    const inputs = [vaultType.depositToken];

    return zapTokens.map(({ token, swap }) => {
      const outputs = [token];
      const selectionId = createSelectionId(vault.chainId, outputs);

      return {
        id: createOptionId(this.id, vault.id, selectionId, swap),
        vaultId: vault.id,
        chainId: vault.chainId,
        selectionId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        depositToken: vaultType.depositToken,
        swapVia: swap,
        strategyId: 'cowcentrated',
        vaultType: 'cowcentrated',
      };
    });
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedWithdrawOption
  ): Promise<WithdrawQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    const { vault, vaultType, zap, getState } = this.helpers;
    const clmVaultType = vaultType as CowcentratedVaultType;

    if (!isCowcentratedLiquidityVault(vault)) {
      throw new Error('Vault is not standard');
    }

    const state = getState();
    const chain = selectChainById(getState(), vault.chainId);
    const clmPool = new BeefyCLMPool(
      vault.earnContractAddress,
      selectVaultStrategyAddress(state, vault.id),
      chain,
      clmVaultType.depositTokens
    );

    const { amount0, amount1 } = await clmPool.previewWithdraw(input.amount);

    const withdrawOutputs: TokenAmount[] = [
      {
        token: clmVaultType.depositTokens[0],
        amount: fromWei(amount0, clmVaultType.depositTokens[0].decimals),
      },
      {
        token: clmVaultType.depositTokens[1],
        amount: fromWei(amount1, clmVaultType.depositTokens[1].decimals),
      },
    ];

    const breakSteps: ZapQuoteStep[] = [
      {
        type: 'split',
        outputs: withdrawOutputs,
        inputToken: clmVaultType.shareToken,
        inputAmount: input.amount,
      },
    ];

    // Common: Token Allowances
    const allowances = [
      {
        token: clmVaultType.shareToken,
        amount: input.amount,
        spenderAddress: zap.manager,
      },
    ];

    if (option.swapVia === 'aggregator') {
      const { outputs, returned, steps, fee } = await this.fetchWithdrawQuoteAggregator(
        option,
        withdrawOutputs,
        [],
        breakSteps
      );
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
        vaultType: 'cowcentrated',
      };
    } else {
      return {
        id: createQuoteId(option.id),
        strategyId: this.id,
        priceImpact: 0,
        option,
        inputs,
        outputs: withdrawOutputs,
        returned: [],
        allowances,
        steps: breakSteps,
        fee: ZERO_FEE,
        vaultType: 'cowcentrated',
      };
    }
  }

  async fetchWithdrawStep(
    quote: CowcentratedVaultWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { vault, vaultType } = this.helpers;
    const clmVault = vaultType as CowcentratedVaultType;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, vault.chainId);
      const clmPool = new BeefyCLMPool(
        clmVault.shareToken.address,
        selectVaultStrategyAddress(state, vault.id),
        chain,
        clmVault.depositTokens
      );
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state, clmPool };

      // Split quote steps
      const splitQuote = quote.steps.find(isZapQuoteStepSplit);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);

      if (!splitQuote) {
        throw new Error('Invalid withdraw quote: missing split step');
      }

      const steps: ZapStep[] = [];

      // Step 1: Withdraw/split from CLM
      const splitZap = await this.fetchZapWithdrawAndSplit(splitQuote, quote.inputs, zapHelpers);
      splitZap.zaps.forEach(step => steps.push(step));

      //Step 2: Swap(s)
      if (swapQuotes.length > 0) {
        if (swapQuotes.length > 2) {
          throw new Error('Invalid withdraw quote: too many swap steps');
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
      const inputs: OrderInput[] = splitZap.inputs.map(input => ({
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
        splitZap.inputs,
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
      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens
      );

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
    const { vault, vaultType, swapAggregator, getState } = this.helpers;
    const depositTokens = (vaultType as CowcentratedVaultType).depositTokens;
    const state = getState();
    const tokenSupport = await swapAggregator.fetchTokenSupport(
      depositTokens,
      vault.id,
      vault.chainId,
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
    option: CowcentratedDepositOption
  ): Promise<CowcentratedVaultDepositQuote> {
    const { vault, getState, vaultType, zap, swapAggregator } = this.helpers;
    const clmVaultType = vaultType as CowcentratedVaultType;
    const state = getState();
    const strategy = selectVaultStrategyAddress(state, vault.id);
    const chain = selectChainById(state, vault.chainId);
    const clmPool = new BeefyCLMPool(
      vault.earnContractAddress,
      strategy,
      chain,
      clmVaultType.depositTokens
    );

    // We want to be able to convert to token1
    const inputPrice = selectTokenPriceByAddress(state, chain.id, input.token.address);
    const token1Price = selectTokenPriceByAddress(
      state,
      chain.id,
      clmVaultType.depositTokens[1].address
    );
    const ratios = await clmPool.getDepositRatioData(input, inputPrice, token1Price);

    // Token allowances
    const allowances = isTokenErc20(input.token)
      ? [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: zap.manager,
          },
        ]
      : [];

    // How much input to swap to each lp token
    const swapInAmounts = ratios.map(ratio => input.amount.times(ratio));

    // Swap quotes
    const quoteRequestsPerLpToken: (QuoteRequest | undefined)[] = clmVaultType.depositTokens.map(
      (lpTokenN, i) =>
        isTokenEqual(lpTokenN, input.token) || swapInAmounts[i].lte(BIG_ZERO)
          ? undefined
          : {
              vaultId: vault.id,
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

        return await swapAggregator.fetchQuotes(quoteRequest, state);
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
      return { token: clmVaultType.depositTokens[i], amount: swapInAmounts[i] };
    });

    const { liquidity, isCalm } = await clmPool.previewDeposit(
      lpTokenAmounts[0].amount,
      lpTokenAmounts[1].amount
    );
    const liquidityAmount = fromWei(liquidity, 18);

    //build quote inputs
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
      outputToken: clmVaultType.shareToken,
      outputAmount: liquidityAmount,
    });

    // Build quote outputs
    const outputs: TokenAmount[] = [
      {
        token: clmVaultType.shareToken,
        amount: liquidityAmount,
      },
    ];

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
      vaultType: 'cowcentrated',
      amountsUsed: [],
      amountsReturned: [],
      isCalm,
    };
  }

  protected async fetchWithdrawQuoteAggregator(
    option: CowcentratedWithdrawOption,
    breakOutputs: TokenAmount[],
    breakReturned: TokenAmount[],
    steps: ZapQuoteStep[]
  ) {
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
            state
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

  protected async fetchZapBuildCLM(
    quoteStep: ZapQuoteStepBuild,
    minInputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage, clmPool } = zapHelpers;

    const {
      liquidity: liquidityWei,
      amount0,
      amount1,
    } = await clmPool.previewDeposit(minInputs[0].amount, minInputs[1].amount);

    const liquidity = fromWei(liquidityWei, quoteStep.outputToken.decimals);
    const addAmounts = [amount0, amount1].map((amount, i) => ({
      token: minInputs[i].token,
      amount: fromWei(amount, minInputs[i].token.decimals),
    }));

    return await this.getZapBuildCLM({
      inputs: addAmounts,
      outputs: [{ token: quoteStep.outputToken, amount: liquidity }],
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  protected async getZapBuildCLM(request: ZapStepRequest): Promise<ZapStepResponse> {
    const clmVault = this.helpers.vaultType as CowcentratedVaultType;
    const { inputs, outputs, maxSlippage, insertBalance } = request;

    if (inputs.length !== 2) {
      throw new Error('Invalid inputs');
    }

    for (const input of inputs) {
      if (isTokenNative(input.token)) throw new Error('Invalid token');
      if (!clmVault.depositTokens.find(token => isTokenEqual(token, input.token))) {
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
          clmVault.shareToken.address,
          toWei(inputs[0].amount, inputs[0].token.decimals),
          toWei(inputs[1].amount, inputs[1].token.decimals),
          toWei(outputs[0].amount, outputs[0].token.decimals),
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
      data: abiCoder.encodeFunctionCall(
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
          outputs: [],
        },
        [amountA.toString(10), amountB.toString(10), liquidity.toString()]
      ),
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

  protected async fetchZapWithdrawAndSplit(
    quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { zap, vaultType } = this.helpers;
    const clmVaultType = vaultType as CowcentratedVaultType;
    const { slippage, clmPool } = zapHelpers;

    const { amount0, amount1 } = await clmPool.previewWithdraw(quoteStep.inputAmount);

    const quoteIndexes = clmVaultType.depositTokens.map(token =>
      quoteStep.outputs.findIndex(
        output => output.token.address.toLocaleLowerCase() === token.address.toLowerCase()
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

    return await this.getZapWithdrawAndSplit({
      inputs,
      outputs,
      maxSlippage: slippage,
      zapRouter: zap.router,
      insertBalance: true,
    });
  }

  protected async getZapWithdrawAndSplit(request: ZapStepRequest): Promise<ZapStepResponse> {
    const { inputs, outputs, maxSlippage } = request;
    const input = onlyOneTokenAmount(inputs);
    const clmVault = this.helpers.vaultType as CowcentratedVaultType;

    if (clmVault.shareToken.address.toLowerCase() !== input.token.address.toLowerCase()) {
      throw new Error('Invalid input token');
    }

    if (outputs.length !== 2) {
      throw new Error('Invalid output count');
    }

    for (const output of outputs) {
      if (!clmVault.depositTokens.find(token => isTokenEqual(token, output.token))) {
        throw new Error('Invalid output token');
      }
    }

    const minOutputs = slipAllBy(outputs, maxSlippage);

    return {
      inputs,
      outputs,
      minOutputs,
      returned: [],
      zaps: [
        this.buildZapWithdrawAndSplitTx(
          input.token.address,
          toWei(input.amount, input.token.decimals),
          // @ReflectiveChimp should we slip here too? or is slippage protection from zap enough?
          toWei(outputs[0].amount, minOutputs[0].token.decimals),
          toWei(outputs[1].amount, minOutputs[1].token.decimals),
          false
        ),
      ],
    };
  }

  protected buildZapWithdrawAndSplitTx(
    clmAddress: string,
    amountToWithdrawWei: BigNumber,
    minAmountAWei: BigNumber,
    minAmountBWei: BigNumber,
    withdrawAll: boolean
  ): ZapStep {
    if (withdrawAll) {
      return {
        target: clmAddress,
        value: '0',
        data: abiCoder.encodeFunctionCall(
          {
            constant: false,
            inputs: [
              {
                name: '_minAmount0',
                type: 'uint256',
              },
              {
                name: '_minAmount1',
                type: 'uint256',
              },
            ],
            name: 'withdrawAll',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
          [minAmountAWei.toString(10), minAmountBWei.toString(10)]
        ),
        tokens: [
          {
            token: clmAddress,
            index: -1,
          },
        ],
      };
    }

    return {
      target: clmAddress,
      value: '0',
      data: abiCoder.encodeFunctionCall(
        {
          constant: false,
          inputs: [
            {
              name: '_shares',
              type: 'uint256',
            },
            {
              name: '_minAmount0',
              type: 'uint256',
            },
            {
              name: '_minAmount1',
              type: 'uint256',
            },
          ],
          name: 'withdraw',
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
        [amountToWithdrawWei.toString(10), minAmountAWei.toString(10), minAmountBWei.toString(10)]
      ),
      tokens: [
        {
          token: clmAddress,
          index: getInsertIndex(0),
        },
      ],
    };
  }
}
