import type BigNumber from 'bignumber.js';
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
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectVaultStrategyAddress } from '../../../../selectors/vaults.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { BeefyCLMPool } from '../../../beefy/beefy-clm-pool.ts';
import { slipAllBy, slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
} from '../../helpers/options.ts';
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes.ts';
import { allTokensAreDistinct, pickTokens } from '../../helpers/tokens.ts';
import { getInsertIndex, getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import type { QuoteRequest } from '../../swap/ISwapProvider.ts';
import {
  type CowcentratedDualZapDepositOption,
  type CowcentratedDualZapDepositQuote,
  type InputTokenAmount,
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
  TransactHelpers,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { CowcentratedDualStrategyConfig } from '../strategy-configs.ts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
  clmPool: BeefyCLMPool;
};

const strategyId = 'cowcentrated-dual';
type StrategyId = typeof strategyId;

class CowcentratedDualStrategyImpl implements IComposableStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composable = true;
  public readonly id = strategyId;
  public readonly disableVaultDeposit = true;

  protected readonly vault: VaultCowcentrated;
  protected readonly vaultType: ICowcentratedVaultType;

  constructor(
    protected options: CowcentratedDualStrategyConfig,
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

  getHelpers(): TransactHelpers {
    return this.helpers;
  }

  async fetchDepositOptions(): Promise<CowcentratedDualZapDepositOption[]> {
    const canSwap = await this.canSwapBetweenDepositTokens();
    if (!canSwap) {
      return [];
    }

    const inputs = this.vaultType.depositTokens;
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return [
      {
        id: createOptionId(this.id, this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.AllTokensInPool,
        inputs,
        wantedOutputs: this.vaultType.depositTokens,
        mode: TransactMode.Deposit,
        strategyId: this.id,
        depositToken: this.vaultType.shareToken,
        lpTokens: this.vaultType.depositTokens,
        vaultType: 'cowcentrated',
        swapVia: 'aggregator',
      },
    ];
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedDualZapDepositOption
  ): Promise<CowcentratedDualZapDepositQuote> {
    onlyInputCount(inputs, 2);

    if (inputs.every(input => input.amount.lte(BIG_ZERO))) {
      throw new Error('Cowcentrated dual strategy: Quote called with all 0 input amounts');
    }

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

    const rebalance = await clmPool.getDualInputRebalanceData(inputs[0].amount, inputs[1].amount);

    // Token allowances for non-zero ERC20 inputs
    const allowances = inputs.flatMap(input =>
      isTokenErc20(input.token) && input.amount.gt(BIG_ZERO) ?
        [{ token: input.token, amount: input.amount, spenderAddress: zap.manager }]
      : []
    );

    const steps: ZapQuoteStep[] = [];
    let lpTokenAmounts: TokenAmount[];

    if (rebalance.needsSwap) {
      const fromToken = this.vaultType.depositTokens[rebalance.swapFromTokenIndex];
      const toTokenIndex = rebalance.swapFromTokenIndex === 0 ? 1 : 0;
      const toToken = this.vaultType.depositTokens[toTokenIndex];

      const quoteRequest: QuoteRequest = {
        vaultId: this.vault.id,
        fromToken,
        fromAmount: rebalance.swapAmount,
        toToken,
      };

      const quotes = await swapAggregator.fetchQuotes(quoteRequest, state, this.options.swap);
      if (!quotes || quotes.length === 0) {
        throw new Error(`No swap quotes found for ${fromToken.symbol} -> ${toToken.symbol}`);
      }
      const bestQuote = first(quotes)!;

      steps.push({
        type: 'swap',
        fromToken: bestQuote.fromToken,
        fromAmount: bestQuote.fromAmount,
        toToken: bestQuote.toToken,
        toAmount: bestQuote.toAmount,
        via: 'aggregator',
        providerId: bestQuote.providerId,
        fee: bestQuote.fee,
        quote: bestQuote,
      });

      // Calculate post-swap LP amounts using actual swap output
      lpTokenAmounts = this.vaultType.depositTokens.map((token, i) => {
        if (i === rebalance.swapFromTokenIndex) {
          // Original amount minus what was swapped
          return { token, amount: inputs[i].amount.minus(rebalance.swapAmount) };
        } else {
          // Original amount plus swap output
          return { token, amount: inputs[i].amount.plus(bestQuote.toAmount) };
        }
      });
    } else {
      // No swap needed, use inputs directly
      lpTokenAmounts = this.vaultType.depositTokens.map((token, i) => ({
        token,
        amount: inputs[i].amount,
      }));
    }

    // Preview CLM deposit
    const { isCalm, liquidity, used0, used1, unused0, unused1, position0, position1 } =
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
      fee: highestFeeOrZero(steps),
      lpQuotes:
        rebalance.needsSwap ?
          [steps.filter(isZapQuoteStepSwap).find(isZapQuoteStepSwapAggregator)?.quote]
        : [],
      vaultType: 'cowcentrated',
      isCalm,
      unused: depositUnused,
      used: depositUsed,
      position: depositPosition,
    };
  }

  async fetchDepositUserlessZapBreakdown(
    quote: CowcentratedDualZapDepositQuote
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

    if (!depositQuote || swapQuotes.length > 1) {
      throw new Error('Invalid quote');
    }

    // Swap (at most 1)
    const insertBalance = allTokensAreDistinct(
      swapQuotes
        .map(quoteStep => quoteStep.fromToken)
        .concat(depositQuote.inputs.map(({ token }) => token))
    );
    const swapZaps = await Promise.all(
      swapQuotes.map(quoteStep => this.fetchZapSwap(quoteStep, zapHelpers, insertBalance))
    );
    swapZaps.forEach(swap => {
      swap.zaps.forEach(step => steps.push(step));
      minBalances.subtractMany(swap.inputs);
      minBalances.addMany(swap.minOutputs);
    });

    // Deposit
    const depositZap = await this.fetchZapDepositCLM(
      depositQuote,
      depositQuote.inputs.map(({ token }) => ({
        token,
        amount: minBalances.get(token),
      })),
      zapHelpers
    );
    depositZap.zaps.forEach(step => steps.push(step));
    minBalances.subtractMany(depositZap.inputs);
    minBalances.addMany(depositZap.minOutputs);

    // Build order
    const inputs: OrderInput[] = quote.inputs
      .filter(input => input.amount.gt(BIG_ZERO))
      .map(input => ({
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

    const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

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
    quote: CowcentratedDualZapDepositQuote,
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

  async fetchWithdrawOptions(): Promise<never[]> {
    return [];
  }

  async fetchWithdrawQuote(_inputs: InputTokenAmount[], _option: never): Promise<never> {
    throw new Error('Cowcentrated dual strategy does not support withdrawals');
  }

  async fetchWithdrawStep(_quote: never, _t: TFunction<Namespace>): Promise<Step> {
    throw new Error('Cowcentrated dual strategy does not support withdrawals');
  }

  async fetchWithdrawUserlessZapBreakdown(_quote: never): Promise<UserlessZapWithdrawBreakdown> {
    throw new Error('Cowcentrated dual strategy does not support withdrawals');
  }

  protected async canSwapBetweenDepositTokens(): Promise<boolean> {
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

    // Check that token0 can swap to token1 or vice versa
    const token0CanSwapToToken1 = tokenSupport.tokens[1].some(t =>
      isTokenEqual(t, depositTokens[0])
    );
    const token1CanSwapToToken0 = tokenSupport.tokens[0].some(t =>
      isTokenEqual(t, depositTokens[1])
    );

    return token0CanSwapToToken1 || token1CanSwapToToken0;
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
        this.buildZapDepositCLMTx(
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

  protected buildZapDepositCLMTx(
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
          index: insertBalance ? getInsertIndex(0) : -1,
        },
        {
          token: tokenB,
          index: insertBalance ? getInsertIndex(1) : -1,
        },
      ],
    };
  }
}

export const CowcentratedDualStrategy =
  CowcentratedDualStrategyImpl satisfies IComposableStrategyStatic<StrategyId>;
