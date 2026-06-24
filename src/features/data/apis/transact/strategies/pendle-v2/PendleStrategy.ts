import type BigNumber from 'bignumber.js';
import { first, uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import {
  BIG_ZERO,
  compareBigNumber,
  fromWei,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number.ts';
import { isFulfilledResult } from '../../../../../../helpers/promises.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  type TokenEntity,
} from '../../../../entities/token.ts';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../../selectors/chains.ts';
import {
  selectIsTokenLoaded,
  selectTokenByAddressOrUndefined,
} from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { isDefined } from '../../../../utils/array-utils.ts';
import {
  PENDLE_ROUTER_STATIC_BY_CHAIN,
  PENDLE_ROUTER_V4,
  PendleMarket,
} from '../../../amm/pendle/PendleMarket.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
  onlyOneToken,
  onlyOneTokenAmount,
} from '../../helpers/options.ts';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes.ts';
import { pickTokens } from '../../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../../helpers/vault.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import type { QuoteResponse } from '../../swap/ISwapProvider.ts';
import {
  type InputTokenAmount,
  isZapQuoteStepBuild,
  isZapQuoteStepSplit,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepWithdraw,
  type PendleV2DepositOption,
  type PendleV2DepositQuote,
  type PendleV2WithdrawOption,
  type PendleV2WithdrawQuote,
  SelectionOrder,
  type TokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepBuild,
  type ZapQuoteStepSplit,
  type ZapQuoteStepSwap,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types.ts';
import { isStandardVaultType, type IStandardVaultType } from '../../vaults/IVaultType.ts';
import { buildTokenApproveTx } from '../../zap/approve.ts';
import { fetchZapAggregatorSwap } from '../../zap/swap.ts';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepResponse,
} from '../../zap/types.ts';
import type {
  IComposableStrategy,
  IComposableStrategyStatic,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { PendleV2StrategyConfig } from '../strategy-configs.ts';
import { canRouteToAnyOf } from '../strategy-eligibility.ts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

type DepositLiquidity = {
  /** Token that is fed into the Pendle market to mint the LP */
  input: TokenAmount;
  /** Resulting LP (vault deposit token) */
  output: TokenAmount;
  /** Which deposit token we minted through */
  via: TokenEntity;
  /** Quote for swapping the user input to `via`, if routing via aggregator */
  quote?: QuoteResponse;
};

type WithdrawLiquidity = {
  /** LP (vault deposit token) being removed */
  input: TokenAmount;
  /** Token received from removing the LP */
  split: TokenAmount;
  /** Final output after optional swap (== split when direct) */
  output: TokenAmount;
  /** Which deposit token we removed through */
  via: TokenEntity;
  /** Quote for swapping `split` to the wanted token, if routing via aggregator */
  quote?: QuoteResponse;
};

const strategyId = 'pendle-v2';
type StrategyId = typeof strategyId;

class PendleStrategyImpl implements IComposableStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composable = true;
  public readonly id = strategyId;

  protected readonly chain: ChainEntity;
  /** The vault deposit token — i.e. the Pendle market LP token */
  protected readonly depositToken: TokenEntity;
  /** Tokens the LP can be minted from / redeemed to directly (SY tokensIn) */
  protected readonly possibleTokens: TokenEntity[];
  protected readonly routerAddress: string;
  protected readonly market: PendleMarket;
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;

  constructor(
    protected options: PendleV2StrategyConfig,
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
    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        throw new Error(`Vault ${vault.id}: Asset ${vault.assetIds[i]} not loaded`);
      }
    }

    this.vault = vault;
    this.vaultType = vaultType;
    this.chain = selectChainById(state, vault.chainId);
    this.depositToken = vaultType.depositToken;

    this.possibleTokens = this.options.depositTokens
      .map(address => selectTokenByAddressOrUndefined(state, vault.chainId, address))
      .filter(isDefined);

    if (!this.possibleTokens.length) {
      throw new Error(
        `Vault ${vault.id}: None of the pendle deposit tokens (${this.options.depositTokens.join(
          ', '
        )}) are in the address book`
      );
    }

    const routerStaticAddress = PENDLE_ROUTER_STATIC_BY_CHAIN[this.chain.id];
    if (!routerStaticAddress) {
      throw new Error(
        `Vault ${vault.id}: no Pendle routerStatic known for chain ${this.chain.id} — add it to PENDLE_ROUTER_STATIC_BY_CHAIN`
      );
    }

    this.routerAddress = PENDLE_ROUTER_V4;
    // The Pendle market token is the vault deposit token (the LP)
    this.market = new PendleMarket(
      this.depositToken.address,
      this.routerAddress,
      routerStaticAddress,
      this.chain
    );
  }

  public getHelpers(): ZapTransactHelpers {
    return this.helpers;
  }

  //
  // Deposit
  //

  public async fetchDepositOptions(): Promise<PendleV2DepositOption[]> {
    const outputs = [this.depositToken];

    const directOptions: PendleV2DepositOption[] = this.possibleTokens.map(token => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);
      return {
        id: createOptionId(this.id, this.vault.id, selectionId, 'direct'),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.TokenOfPool,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId,
        via: 'direct',
        viaToken: token,
      };
    });

    const { any: allAggregatorTokens, map: tokenToDepositTokens } =
      await this.aggregatorTokenSupport();

    const aggregatorOptions: PendleV2DepositOption[] = allAggregatorTokens
      .filter(token => tokenToDepositTokens[token.address].length > 0)
      .map(token => {
        const inputs = [token];
        const selectionId = createSelectionId(this.vault.chainId, inputs);
        return {
          id: createOptionId(this.id, this.vault.id, selectionId, 'aggregator'),
          vaultId: this.vault.id,
          chainId: this.vault.chainId,
          selectionId,
          selectionOrder: SelectionOrder.Other,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Deposit,
          strategyId,
          via: 'aggregator',
          viaTokens: tokenToDepositTokens[token.address],
        };
      });

    return directOptions.concat(aggregatorOptions);
  }

  protected async getDepositLiquidityDirect(
    input: InputTokenAmount,
    viaToken: TokenEntity
  ): Promise<DepositLiquidity> {
    if (!isTokenEqual(input.token, viaToken)) {
      throw new Error(
        `Pendle strategy: Direct deposit called with input token ${input.token.symbol} but expected ${viaToken.symbol}`
      );
    }

    const lpOutWei = await this.market.quoteAddLiquidity(
      viaToken,
      toWei(input.amount, viaToken.decimals)
    );
    const output: TokenAmount = {
      token: this.depositToken,
      amount: fromWei(lpOutWei, this.depositToken.decimals),
    };
    return { input, output, via: viaToken };
  }

  protected async getDepositLiquidityAggregator(
    state: BeefyState,
    input: InputTokenAmount,
    viaTokens: TokenEntity[]
  ): Promise<DepositLiquidity> {
    const { swapAggregator } = this.helpers;

    // Swap quotes from the user input to each candidate deposit token
    const maybeQuotes = await Promise.allSettled(
      viaTokens.map(async viaToken => {
        const quotes = await swapAggregator.fetchQuotes(
          {
            vaultId: this.vault.id,
            fromToken: input.token,
            fromAmount: input.amount,
            toToken: viaToken,
          },
          state,
          this.options.swap
        );
        const bestQuote = first(quotes);
        if (!bestQuote) {
          throw new Error(`No quote for ${input.token.symbol} to ${viaToken.symbol}`);
        }
        return { via: viaToken, quote: bestQuote };
      })
    );
    const quotes = maybeQuotes
      .filter(isFulfilledResult)
      .map(r => r.value)
      .filter(isDefined);
    if (!quotes.length) {
      throw new Error(`No quotes for ${input.token.symbol} to any pendle deposit token`);
    }

    // For each, compute how much LP we would mint, then pick the best
    const withLiquidity = await Promise.all(
      quotes.map(async ({ via, quote }) => {
        const lpOutWei = await this.market.quoteAddLiquidity(
          via,
          toWei(quote.toAmount, via.decimals)
        );
        return {
          via,
          quote,
          input: { token: quote.toToken, amount: quote.toAmount },
          output: {
            token: this.depositToken,
            amount: fromWei(lpOutWei, this.depositToken.decimals),
          },
        };
      })
    );

    withLiquidity.sort((a, b) => compareBigNumber(b.output.amount, a.output.amount));
    return withLiquidity[0];
  }

  protected async getDepositLiquidity(
    state: BeefyState,
    input: InputTokenAmount,
    option: PendleV2DepositOption
  ): Promise<DepositLiquidity> {
    if (option.via === 'direct') {
      return this.getDepositLiquidityDirect(input, option.viaToken);
    }
    return this.getDepositLiquidityAggregator(state, input, option.viaTokens);
  }

  public async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: PendleV2DepositOption
  ): Promise<PendleV2DepositQuote> {
    const { zap, getState } = this.helpers;
    const state = getState();
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Pendle strategy: Quote called with 0 input amount');
    }

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

    const depositLiquidity = await this.getDepositLiquidity(state, input, option);

    const steps: ZapQuoteStep[] = [];

    if (depositLiquidity.quote) {
      steps.push({
        type: 'swap',
        fromToken: depositLiquidity.quote.fromToken,
        fromAmount: depositLiquidity.quote.fromAmount,
        toToken: depositLiquidity.quote.toToken,
        toAmount: depositLiquidity.quote.toAmount,
        via: 'aggregator',
        providerId: depositLiquidity.quote.providerId,
        fee: depositLiquidity.quote.fee,
        quote: depositLiquidity.quote,
      });
    }

    steps.push({
      type: 'build',
      inputs: [depositLiquidity.input],
      outputToken: depositLiquidity.output.token,
      outputAmount: depositLiquidity.output.amount,
      providerId: 'pendle',
    });

    steps.push({
      type: 'deposit',
      inputs: [
        {
          token: depositLiquidity.output.token,
          amount: depositLiquidity.output.amount,
        },
      ],
    });

    const outputs: TokenAmount[] = [depositLiquidity.output];
    const returned: TokenAmount[] = [];

    return {
      id: createQuoteId(option.id),
      strategyId,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: ZERO_FEE,
      via: option.via,
      viaToken: depositLiquidity.via,
    };
  }

  protected async fetchZapSwap(
    quoteStep: ZapQuoteStepSwap,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    if (isZapQuoteStepSwapAggregator(quoteStep)) {
      return this.fetchZapSwapAggregator(quoteStep, zapHelpers, insertBalance);
    }
    throw new Error('Unknown zap quote swap step type');
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
    viaToken: TokenEntity,
    minInputAmount: BigNumber,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const minInputWei = toWei(minInputAmount, viaToken.decimals);
    const lpOutWei = await this.market.quoteAddLiquidity(viaToken, minInputWei);
    const lpOut = fromWei(lpOutWei, this.depositToken.decimals);
    const minLpOut = slipBy(lpOut, slippage, this.depositToken.decimals);

    return {
      inputs: [{ token: viaToken, amount: minInputAmount }],
      outputs: [{ token: this.depositToken, amount: lpOut }],
      minOutputs: [{ token: this.depositToken, amount: minLpOut }],
      returned: [],
      zaps: [
        buildTokenApproveTx(viaToken.address, this.routerAddress, minInputWei, insertBalance),
        this.market.buildAddLiquidityZap({
          tokenIn: viaToken,
          amountInWei: minInputWei,
          minLpOutWei: toWei(minLpOut, this.depositToken.decimals),
          receiver: this.helpers.zap.router,
          insertBalance,
        }),
      ],
    };
  }

  async fetchDepositUserlessZapBreakdown(
    quote: PendleV2DepositQuote
  ): Promise<UserlessZapDepositBreakdown> {
    const state = this.helpers.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const slippage = selectTransactSlippage(state);
    const zapHelpers: ZapHelpers = { chain, slippage, state };
    const steps: ZapStep[] = [];
    const minBalances = new Balances(quote.inputs);
    const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
    const buildQuote = quote.steps.find(isZapQuoteStepBuild);

    if (!buildQuote) {
      throw new Error('PendleStrategy: No build step in quote');
    }
    if (swapQuotes.length > 1) {
      throw new Error('PendleStrategy: Too many swaps in quote');
    }

    // Swap to deposit token (if needed)
    if (swapQuotes.length) {
      const swapQuote = swapQuotes[0];
      const swap = await this.fetchZapSwap(swapQuote, zapHelpers, true);
      swap.zaps.forEach(zap => steps.push(zap));
      minBalances.subtractMany(swap.inputs);
      minBalances.addMany(swap.minOutputs);
    }

    // Build LP via Pendle (approve + addLiquiditySingleToken)
    const buildZap = await this.fetchZapBuild(
      buildQuote,
      quote.viaToken,
      minBalances.get(quote.viaToken),
      zapHelpers,
      true
    );
    buildZap.zaps.forEach(step => steps.push(step));
    minBalances.subtractMany(buildZap.inputs);
    minBalances.addMany(buildZap.minOutputs);

    // Deposit LP in vault
    const vaultDeposit = await this.vaultType.fetchZapDeposit({
      inputs: [
        {
          token: buildQuote.outputToken,
          amount: minBalances.get(buildQuote.outputToken), // min expected in case add liquidity slipped
          max: true,
        },
      ],
      from: this.helpers.zap.router,
    });
    steps.push(vaultDeposit.zap);
    minBalances.subtractMany(vaultDeposit.inputs);
    minBalances.addMany(vaultDeposit.minOutputs);

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
    dustOutputs.push({
      token: getTokenAddress(buildQuote.outputToken),
      minOutputAmount: '0',
    });

    // @dev uniqBy: first occurrence of each element is kept.
    const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs,
        outputs,
        relay: NO_RELAY,
      },
      steps,
    };

    const expectedTokens = vaultDeposit.outputs.map(output => output.token);

    return { zapRequest, expectedTokens, minBalances };
  }

  public async fetchDepositStep(
    quote: PendleV2DepositQuote,
    t: TFunction<Namespace<string>>
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

  //
  // Withdraw
  //

  async fetchWithdrawOptions(): Promise<PendleV2WithdrawOption[]> {
    const inputs = [this.depositToken];

    const directOptions: PendleV2WithdrawOption[] = this.possibleTokens.map(token => {
      const outputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, outputs);
      return {
        id: createOptionId(this.id, this.vault.id, selectionId, 'direct'),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.TokenOfPool,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        strategyId,
        via: 'direct',
        viaToken: token,
      };
    });

    const { any: allAggregatorTokens, map: tokenToDepositTokens } =
      await this.aggregatorTokenSupport();

    const aggregatorOptions: PendleV2WithdrawOption[] = allAggregatorTokens
      .filter(token => tokenToDepositTokens[token.address].length > 0)
      .map(token => {
        const outputs = [token];
        const selectionId = createSelectionId(this.vault.chainId, outputs);
        return {
          id: createOptionId(this.id, this.vault.id, selectionId, 'aggregator'),
          vaultId: this.vault.id,
          chainId: this.vault.chainId,
          selectionId,
          selectionOrder: SelectionOrder.Other,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Withdraw,
          strategyId,
          via: 'aggregator',
          viaTokens: tokenToDepositTokens[token.address],
        };
      });

    return directOptions.concat(aggregatorOptions);
  }

  protected async getWithdrawLiquidityDirect(
    input: TokenAmount,
    wanted: TokenEntity,
    viaToken: TokenEntity
  ): Promise<WithdrawLiquidity> {
    if (!isTokenEqual(wanted, viaToken)) {
      throw new Error(
        `Pendle strategy: Direct withdraw called with wanted token ${wanted.symbol} but expected ${viaToken.symbol}`
      );
    }

    const tokenOutWei = await this.market.quoteRemoveLiquidity(
      toWei(input.amount, input.token.decimals),
      viaToken
    );
    const split: TokenAmount = { token: viaToken, amount: fromWei(tokenOutWei, viaToken.decimals) };
    // no further steps so output is same as split
    return { input, split, output: split, via: viaToken };
  }

  protected async getWithdrawLiquidityAggregator(
    state: BeefyState,
    input: TokenAmount,
    wanted: TokenEntity,
    viaTokens: TokenEntity[]
  ): Promise<WithdrawLiquidity> {
    const { swapAggregator } = this.helpers;
    const slippage = selectTransactSlippage(state);

    // For each candidate deposit token, remove liquidity then swap to wanted
    const withSwaps = await Promise.all(
      viaTokens.map(async viaToken => {
        const tokenOutWei = await this.market.quoteRemoveLiquidity(
          toWei(input.amount, input.token.decimals),
          viaToken
        );
        const split: TokenAmount = {
          token: viaToken,
          amount: fromWei(tokenOutWei, viaToken.decimals),
        };
        const quotes = await swapAggregator.fetchQuotes(
          {
            vaultId: this.vault.id,
            fromToken: split.token,
            fromAmount: slipBy(split.amount, slippage, split.token.decimals), // assume it slips since we can't modify calldata later
            toToken: wanted,
          },
          state,
          this.options.swap
        );
        const quote = first(quotes);
        return {
          via: viaToken,
          quote,
          input,
          split,
          output: { token: wanted, amount: quote ? quote.toAmount : BIG_ZERO },
        };
      })
    );

    withSwaps.sort((a, b) => compareBigNumber(b.output.amount, a.output.amount));
    return withSwaps[0];
  }

  protected async getWithdrawLiquidity(
    state: BeefyState,
    input: TokenAmount,
    wanted: TokenEntity,
    option: PendleV2WithdrawOption
  ): Promise<WithdrawLiquidity> {
    if (option.via === 'direct') {
      return this.getWithdrawLiquidityDirect(input, wanted, option.viaToken);
    }
    return this.getWithdrawLiquidityAggregator(state, input, wanted, option.viaTokens);
  }

  public async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: PendleV2WithdrawOption
  ): Promise<PendleV2WithdrawQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }
    if (option.wantedOutputs.length !== 1) {
      throw new Error('Can only swap to 1 output token');
    }

    const { zap, getState } = this.helpers;
    const state = getState();

    // Withdraw from vault
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, this.vault, state);
    const withdrawnAmountAfterFee = fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals);
    const liquidityWithdrawn = { amount: withdrawnAmountAfterFee, token: withdrawnToken };
    const wantedToken = onlyOneToken(option.wantedOutputs);
    const returned: TokenAmount[] = [];

    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: zap.manager,
      },
    ];

    const withdrawnLiquidity = await this.getWithdrawLiquidity(
      state,
      liquidityWithdrawn,
      wantedToken,
      option
    );

    const steps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        outputs: [
          {
            token: this.depositToken,
            amount: withdrawnAmountAfterFee,
          },
        ],
      },
    ];

    steps.push({
      type: 'split',
      inputToken: this.depositToken,
      inputAmount: withdrawnAmountAfterFee,
      outputs: [withdrawnLiquidity.split],
    });

    if (withdrawnLiquidity.quote) {
      steps.push({
        type: 'swap',
        fromToken: withdrawnLiquidity.quote.fromToken,
        fromAmount: withdrawnLiquidity.quote.fromAmount,
        toToken: withdrawnLiquidity.quote.toToken,
        toAmount: withdrawnLiquidity.quote.toAmount,
        via: 'aggregator',
        providerId: withdrawnLiquidity.quote.providerId,
        fee: withdrawnLiquidity.quote.fee,
        quote: withdrawnLiquidity.quote,
      });

      const unused = withdrawnLiquidity.split.amount.minus(withdrawnLiquidity.quote.fromAmount);
      if (unused.gt(BIG_ZERO)) {
        returned.push({ token: withdrawnLiquidity.split.token, amount: unused });
      }
    }

    if (returned.length > 0) {
      steps.push({
        type: 'unused',
        outputs: returned,
      });
    }

    const outputs: TokenAmount[] = [withdrawnLiquidity.output];

    return {
      id: createQuoteId(option.id),
      strategyId,
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: ZERO_FEE,
      via: option.via,
      viaToken: withdrawnLiquidity.via,
    };
  }

  protected async fetchZapSplit(
    _quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    viaToken: TokenEntity,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const input = onlyOneTokenAmount(inputs); // LP
    const lpWei = toWei(input.amount, input.token.decimals);
    const tokenOutWei = await this.market.quoteRemoveLiquidity(lpWei, viaToken);
    const tokenOut = fromWei(tokenOutWei, viaToken.decimals);
    const minTokenOut = slipBy(tokenOut, slippage, viaToken.decimals);

    return {
      inputs,
      outputs: [{ token: viaToken, amount: tokenOut }],
      minOutputs: [{ token: viaToken, amount: minTokenOut }],
      returned: [],
      zaps: [
        buildTokenApproveTx(input.token.address, this.routerAddress, lpWei, insertBalance),
        this.market.buildRemoveLiquidityZap({
          lpAddress: input.token.address,
          netLpWei: lpWei,
          tokenOut: viaToken,
          minTokenOutWei: toWei(minTokenOut, viaToken.decimals),
          receiver: this.helpers.zap.router,
          insertBalance,
        }),
      ],
    };
  }

  async fetchWithdrawUserlessZapBreakdown(
    quote: PendleV2WithdrawQuote
  ): Promise<UserlessZapWithdrawBreakdown> {
    const state = this.helpers.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const slippage = selectTransactSlippage(state);
    const zapHelpers: ZapHelpers = { chain, slippage, state };
    const withdrawQuote = quote.steps.find(isZapQuoteStepWithdraw);
    const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
    const splitQuote = quote.steps.find(isZapQuoteStepSplit);

    if (!withdrawQuote || !splitQuote) {
      throw new Error('Withdraw quote missing withdraw or split step');
    }
    if (swapQuotes.length > 1) {
      throw new Error('PendleStrategy: Too many swaps in withdraw quote');
    }

    // Step 1. Withdraw LP from vault
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

    const steps: ZapStep[] = [vaultWithdraw.zap];

    // Step 2. Remove liquidity (split LP -> deposit token)
    const splitZap = await this.fetchZapSplit(
      splitQuote,
      [withdrawOutput],
      quote.viaToken,
      zapHelpers,
      true
    );
    splitZap.zaps.forEach(step => steps.push(step));

    // Step 3. Swap to wanted token (if needed)
    if (swapQuotes.length > 0) {
      const swapQuote = swapQuotes[0];
      const input = splitZap.minOutputs.find(o => isTokenEqual(o.token, swapQuote.fromToken));
      if (!input) {
        throw new Error('Swap input not found in split outputs');
      }
      // last (only) swap can use 100% of balance
      const swapZap = await this.fetchZapSwap(swapQuote, zapHelpers, true);
      swapZap.zaps.forEach(step => steps.push(step));
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

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs,
        outputs,
        relay: NO_RELAY,
      },
      steps,
    };

    const expectedTokens = quote.outputs.map(output => output.token);

    return { zapRequest, expectedTokens };
  }

  public async fetchWithdrawStep(
    quote: PendleV2WithdrawQuote,
    t: TFunction<Namespace<string>>
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

  async canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean> {
    return this.canRouteTokenAcrossPool(token);
  }

  async canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean> {
    return this.canRouteTokenAcrossPool(token);
  }

  protected async canRouteTokenAcrossPool(token: TokenEntity): Promise<boolean> {
    const tokens = this.possibleTokens.filter(t => !isTokenNative(t));
    return canRouteToAnyOf(this.helpers, this.options.swap, tokens, token);
  }

  protected async aggregatorTokenSupport() {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const supportedAggregatorTokens = await swapAggregator.fetchTokenSupport(
      this.possibleTokens,
      this.vault.id,
      this.vault.chainId,
      state,
      this.options.swap
    );

    return {
      ...supportedAggregatorTokens,
      map: Object.fromEntries(
        supportedAggregatorTokens.any.map(
          t =>
            [
              t.address,
              this.possibleTokens.filter(
                (o, i) =>
                  // disable native as a swap target — zap can't insert balance of native in calldata
                  !isTokenNative(o) &&
                  !isTokenEqual(o, t) &&
                  supportedAggregatorTokens.tokens[i].length > 1 &&
                  supportedAggregatorTokens.tokens[i].some(st => isTokenEqual(st, o))
              ),
            ] as [string, TokenEntity[]]
        )
      ),
    };
  }
}

export const PendleStrategy = PendleStrategyImpl satisfies IComposableStrategyStatic<StrategyId>;
