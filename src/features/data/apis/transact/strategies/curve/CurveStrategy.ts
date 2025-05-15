import type BigNumber from 'bignumber.js';
import { first, uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
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
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token.ts';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenByAddressOrUndefined,
  selectTokenPriceByTokenOracleId,
} from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { isDefined } from '../../../../utils/array-utils.ts';
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
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes.ts';
import { allTokensAreDistinct, pickTokens } from '../../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../../helpers/vault.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import type { QuoteResponse } from '../../swap/ISwapProvider.ts';
import {
  type CurveDepositOption,
  type CurveDepositQuote,
  type CurveWithdrawOption,
  type CurveWithdrawQuote,
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
import type { IZapStrategy, IZapStrategyStatic, ZapTransactHelpers } from '../IStrategy.ts';
import type { CurveStrategyConfig } from '../strategy-configs.ts';
import { CurvePool } from './CurvePool.ts';
import type { CurveMethod, CurveTokenOption } from './types.ts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  poolAddress: string;
  state: BeefyState;
};

type DepositLiquidity = {
  /** Liquidity input (coin for deposit, lp for withdraw) */
  input: TokenAmount;
  /** Liquidity output (lp for deposit, coin for withdraw) */
  output: TokenAmount;
  /** Which method we are using to deposit/withdraw liquidity */
  via: CurveTokenOption;
  /** Quote for swapping to/from coin if required */
  quote?: QuoteResponse;
};

type WithdrawLiquidity = DepositLiquidity & {
  /** How much token we have after the split */
  split: TokenAmount;
};

const strategyId = 'curve';
type StrategyId = typeof strategyId;

class CurveStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected readonly native: TokenNative;
  protected readonly wnative: TokenErc20;
  protected readonly possibleTokens: CurveTokenOption[];
  protected readonly chain: ChainEntity;
  protected readonly depositToken: TokenEntity;
  protected readonly poolAddress: string;
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;

  constructor(
    protected options: CurveStrategyConfig,
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
    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
    this.depositToken = vaultType.depositToken;
    this.chain = selectChainById(state, vault.chainId);
    this.possibleTokens = this.selectAvailableTokens(state, this.chain.id, this.options.methods);
    this.poolAddress = this.options.poolAddress || this.depositToken.address;

    if (!this.possibleTokens.length) {
      throw new Error(
        `Vault ${
          vault.id
        }: No tokens configured are available in addressbook, wanted one of ${this.options.methods
          .flatMap(m => m.coins)
          .join(', ')}`
      );
    }
  }

  /**
   * Tokens are available so long as they are in the address book
   */
  protected selectAvailableTokens(
    state: BeefyState,
    chainId: ChainEntity['id'],
    methods: CurveMethod[]
  ): CurveTokenOption[] {
    type MaybeCurveTokenOptionWithPrice = Omit<CurveTokenOption, 'token'> & {
      price: BigNumber | undefined;
      token: TokenEntity | undefined;
    };
    type CurveTokenOptionWithPrice = CurveTokenOption & {
      price: BigNumber;
    };

    return uniqBy(
      methods
        .flatMap(option =>
          option.coins.map((address, i) => {
            const token = selectTokenByAddressOrUndefined(state, chainId, address);
            return {
              type: option.type,
              target: option.target,
              index: i,
              numCoins: option.coins.length,
              token,
              price: token && selectTokenPriceByTokenOracleId(state, token.oracleId),
            } satisfies MaybeCurveTokenOptionWithPrice;
          })
        )
        .filter(
          (option: MaybeCurveTokenOptionWithPrice): option is CurveTokenOptionWithPrice =>
            !!option.token && !!option.price && option.price.gt(BIG_ZERO)
        ),
      option => `${option.token.chainId}-${option.token.address}`
    );
  }

  public async fetchDepositOptions(): Promise<CurveDepositOption[]> {
    const outputs = [this.vaultType.depositToken];

    const baseOptions: CurveDepositOption[] = this.possibleTokens.map(depositToken => {
      const inputs = [depositToken.token];
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
        strategyId: 'curve',
        via: 'direct',
        viaToken: depositToken,
      };
    });

    const { any: allAggregatorTokens, map: tokenToDepositTokens } =
      await this.aggregatorTokenSupport();

    const aggregatorOptions: CurveDepositOption[] = allAggregatorTokens
      .filter(token => tokenToDepositTokens[token.address].length > 0)
      .map(token => {
        const inputs = [token];
        const selectionId = createSelectionId(this.vault.chainId, inputs);
        const possible = tokenToDepositTokens[token.address];

        if (possible.length === 0) {
          console.error({ vault: this.vault.id, token, possible });
          throw new Error(`No other tokens supported for ${token.symbol}`);
        }

        return {
          id: createOptionId(this.id, this.vault.id, selectionId, 'aggregator'),
          vaultId: this.vault.id,
          chainId: this.vault.chainId,
          selectionId,
          selectionOrder: SelectionOrder.Other,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Deposit,
          strategyId: 'curve',
          via: 'aggregator',
          viaTokens: possible,
        };
      });

    return baseOptions.concat(aggregatorOptions);
  }

  protected async getDepositLiquidityDirect(
    input: InputTokenAmount,
    depositVia: CurveTokenOption
  ): Promise<DepositLiquidity> {
    if (!isTokenEqual(input.token, depositVia.token)) {
      throw new Error(
        `Curve strategy: Direct deposit called with input token ${input.token.symbol} but expected ${depositVia.token.symbol}`
      );
    }

    const pool = new CurvePool(depositVia, this.poolAddress, this.chain, this.depositToken);
    const output = await pool.quoteAddLiquidity(input.amount);
    return { input, output, via: depositVia };
  }

  protected async getDepositLiquidityAggregator(
    state: BeefyState,
    input: InputTokenAmount,
    depositVias: CurveTokenOption[]
  ): Promise<DepositLiquidity> {
    const { swapAggregator } = this.helpers;

    // Fetch quotes from input token, to each possible deposit via token
    const maybeQuotes = await Promise.allSettled(
      depositVias.map(async depositVia => {
        const quotes = await swapAggregator.fetchQuotes(
          {
            vaultId: this.vault.id,
            fromToken: input.token,
            fromAmount: input.amount,
            toToken: depositVia.token,
          },
          state,
          this.options.swap
        );
        const bestQuote = first(quotes);
        if (!bestQuote) {
          throw new Error(`No quote for ${input.token.symbol} to ${depositVia.token.symbol}`);
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

    // For the best quote per deposit via token, calculate how much liquidity we get
    const withLiquidity = await Promise.all(
      quotes.map(async ({ via, quote }) => {
        const pool = new CurvePool(via, this.poolAddress, this.chain, this.depositToken);
        return {
          via,
          quote,
          input: { token: quote.toToken, amount: quote.toAmount },
          output: await pool.quoteAddLiquidity(quote.toAmount),
        };
      })
    );

    // sort by most liquidity
    withLiquidity.sort((a, b) => compareBigNumber(b.output.amount, a.output.amount));

    // Get the one which gives the most liquidity
    return withLiquidity[0];
  }

  protected async getDepositLiquidity(
    state: BeefyState,
    input: InputTokenAmount,
    option: CurveDepositOption
  ): Promise<DepositLiquidity> {
    if (option.via === 'direct') {
      return this.getDepositLiquidityDirect(input, option.viaToken);
    }
    return this.getDepositLiquidityAggregator(state, input, option.viaTokens);
  }

  public async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CurveDepositOption
  ): Promise<CurveDepositQuote> {
    const { zap, getState } = this.helpers;
    const state = getState();
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Curve strategy: Quote called with 0 input amount');
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

    // Fetch liquidity (and swap quote if aggregator)
    const depositLiquidity = await this.getDepositLiquidity(state, input, option);

    // Build quote steps
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

    // Build quote outputs
    const outputs: TokenAmount[] = [depositLiquidity.output];
    const returned: TokenAmount[] = [];

    // Build quote
    return {
      id: createQuoteId(option.id),
      strategyId: 'curve',
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state), // includes the zap fee
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: highestFeeOrZero(steps),
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
    depositVia: CurveTokenOption,
    minInputAmount: BigNumber,
    zapHelpers: ZapHelpers,
    insertBalance: boolean = false
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const pool = new CurvePool(depositVia, this.poolAddress, this.chain, this.depositToken);
    const liquidity = await pool.quoteAddLiquidity(minInputAmount);
    const minLiquidity = slipBy(liquidity.amount, slippage, liquidity.token.decimals);

    return {
      inputs: [{ token: depositVia.token, amount: minInputAmount }],
      outputs: [liquidity],
      minOutputs: [{ token: liquidity.token, amount: minLiquidity }],
      returned: [],
      zaps: [
        pool.buildZapAddLiquidityTx(
          toWei(minInputAmount, depositVia.token.decimals),
          toWei(minLiquidity, liquidity.token.decimals),
          insertBalance
        ),
      ],
    };
  }

  public async fetchDepositStep(
    quote: CurveDepositQuote,
    t: TFunction<Namespace<string>>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = {
        chain,
        slippage,
        state,
        poolAddress: this.options.poolAddress || this.depositToken.address,
      };
      const steps: ZapStep[] = [];
      const minBalances = new Balances(quote.inputs);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const buildQuote = quote.steps.find(isZapQuoteStepBuild);

      if (!buildQuote) {
        throw new Error('CurveStrategy: No build step in quote');
      }

      // wrap and asset swap, 2 max
      if (swapQuotes.length > 2) {
        throw new Error('CurveStrategy: Too many swaps');
      }

      // Swaps
      if (swapQuotes.length) {
        if (swapQuotes.length > 1) {
          throw new Error('CurveStrategy: Too many swaps in quote');
        }

        const swapQuote = swapQuotes[0];
        const swap = await this.fetchZapSwap(swapQuote, zapHelpers, true);
        // add step to order
        swap.zaps.forEach(zap => steps.push(zap));
        // track minimum balances for use in further steps
        minBalances.subtractMany(swap.inputs);
        minBalances.addMany(swap.minOutputs);
      }

      // Build LP
      const buildZap = await this.fetchZapBuild(
        buildQuote,
        quote.viaToken,
        minBalances.get(quote.viaToken.token),
        zapHelpers,
        true
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
      console.log('fetchDepositStep::vaultDeposit', vaultDeposit);
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

  async fetchWithdrawOptions(): Promise<CurveWithdrawOption[]> {
    const inputs = [this.vaultType.depositToken];

    const baseOptions: CurveWithdrawOption[] = this.possibleTokens.map(depositToken => {
      const outputs = [depositToken.token];
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
        strategyId: 'curve',
        via: 'direct',
        viaToken: depositToken,
      };
    });

    const { any: allAggregatorTokens, map: tokenToDepositTokens } =
      await this.aggregatorTokenSupport();

    const aggregatorOptions: CurveWithdrawOption[] = allAggregatorTokens
      .filter(token => tokenToDepositTokens[token.address].length > 0)
      .map(token => {
        const outputs = [token];
        const selectionId = createSelectionId(this.vault.chainId, outputs);
        const possible = tokenToDepositTokens[token.address];

        if (possible.length === 0) {
          console.error({ vault: this.vault.id, token, possible });
          throw new Error(`No other tokens supported for ${token.symbol}`);
        }

        return {
          id: createOptionId(this.id, this.vault.id, selectionId, 'aggregator'),
          vaultId: this.vault.id,
          chainId: this.vault.chainId,
          selectionId,
          selectionOrder: SelectionOrder.Other,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Withdraw,
          strategyId: 'curve',
          via: 'aggregator',
          viaTokens: possible,
        };
      });

    return baseOptions.concat(aggregatorOptions);
  }

  protected async getWithdrawLiquidityDirect(
    input: TokenAmount,
    wanted: TokenEntity,
    withdrawVia: CurveTokenOption
  ): Promise<WithdrawLiquidity> {
    if (!isTokenEqual(wanted, withdrawVia.token)) {
      throw new Error(
        `Curve strategy: Direct withdraw called with wanted token ${input.token.symbol} but expected ${withdrawVia.token.symbol}`
      );
    }

    const pool = new CurvePool(withdrawVia, this.poolAddress, this.chain, this.depositToken);
    const split = await pool.quoteRemoveLiquidity(input.amount);

    // no further steps so output is same as split
    return { input, split, output: split, via: withdrawVia };
  }

  protected async getWithdrawLiquidityAggregator(
    state: BeefyState,
    input: TokenAmount,
    wanted: TokenEntity,
    withdrawVias: CurveTokenOption[]
  ): Promise<WithdrawLiquidity> {
    const { swapAggregator } = this.helpers;
    const slippage = selectTransactSlippage(state);

    // Fetch withdraw liquidity quotes for each possible withdraw via token
    const quotes = await Promise.all(
      withdrawVias.map(async withdrawVia => {
        const pool = new CurvePool(withdrawVia, this.poolAddress, this.chain, this.depositToken);
        const split = await pool.quoteRemoveLiquidity(input.amount);
        return { via: withdrawVia, split };
      })
    );

    // Fetch swap quote between withdrawn token and wanted token
    const withSwaps = await Promise.all(
      quotes.map(async ({ via, split }) => {
        const quotes = await swapAggregator.fetchQuotes(
          {
            vaultId: this.vault.id,
            fromToken: split.token,
            fromAmount: slipBy(split.amount, slippage, split.token.decimals), // we have to assume it will slip 100% since we can't modify the call data later
            toToken: wanted,
          },
          state,
          this.options.swap
        );
        const quote = first(quotes);

        return {
          via,
          quote,
          input,
          split,
          output: { token: wanted, amount: quote ? quote.toAmount : BIG_ZERO },
        };
      })
    );

    // sort by most output
    withSwaps.sort((a, b) => compareBigNumber(b.output.amount, a.output.amount));

    // Get the one which gives the most output
    return withSwaps[0];
  }

  protected async getWithdrawLiquidity(
    state: BeefyState,
    input: TokenAmount,
    wanted: TokenEntity,
    option: CurveWithdrawOption
  ): Promise<WithdrawLiquidity> {
    if (option.via === 'direct') {
      return this.getWithdrawLiquidityDirect(input, wanted, option.viaToken);
    }
    return this.getWithdrawLiquidityAggregator(state, input, wanted, option.viaTokens);
  }

  public async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: CurveWithdrawOption
  ): Promise<CurveWithdrawQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    if (option.wantedOutputs.length !== 1) {
      throw new Error('Can only swap to 1 output token');
    }

    const { zap, getState } = this.helpers;

    // Common: Withdraw from vault
    const state = getState();
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, this.vault, state);
    const withdrawnAmountAfterFee = fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals);
    const liquidityWithdrawn = { amount: withdrawnAmountAfterFee, token: withdrawnToken };
    const wantedToken = onlyOneToken(option.wantedOutputs);
    const returned: TokenAmount[] = [];

    // Common: Token Allowances
    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: zap.manager,
      },
    ];

    // Fetch remove liquidity (and swap quote if aggregator)
    const withdrawnLiquidity = await this.getWithdrawLiquidity(
      state,
      liquidityWithdrawn,
      wantedToken,
      option
    );

    // Build quote steps
    const steps: ZapQuoteStep[] = [
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

    steps.push({
      type: 'split',
      inputToken: withdrawnLiquidity.input.token,
      inputAmount: withdrawnLiquidity.input.amount,
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
      strategyId: 'curve',
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      via: option.via,
      viaToken: withdrawnLiquidity.via,
      fee: highestFeeOrZero(steps),
    };
  }

  protected async fetchZapSplit(
    _quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    via: CurveTokenOption,
    zapHelpers: ZapHelpers,
    insertBalance: boolean = false
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const input = onlyOneTokenAmount(inputs);
    const pool = new CurvePool(via, this.poolAddress, this.chain, this.depositToken);
    const output = await pool.quoteRemoveLiquidity(input.amount);
    const minOutputAmount = slipBy(output.amount, slippage, output.token.decimals);
    const zaps: ZapStep[] = [
      pool.buildZapRemoveLiquidityTx(
        toWei(input.amount, input.token.decimals),
        toWei(minOutputAmount, output.token.decimals),
        insertBalance
      ),
    ];

    // Must approve the curve zap contact to spend the LP token
    if (via.target !== this.poolAddress) {
      zaps.unshift(
        buildTokenApproveTx(
          input.token.address, // token address
          via.target, // spender
          toWei(input.amount, input.token.decimals), // amount in wei
          insertBalance
        )
      );
    }

    return {
      inputs,
      outputs: [output],
      minOutputs: [{ token: output.token, amount: minOutputAmount }],
      returned: [],
      zaps,
    };
  }

  public async fetchWithdrawStep(
    quote: CurveWithdrawQuote,
    t: TFunction<Namespace<string>>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = {
        chain,
        slippage,
        state,
        poolAddress: this.options.poolAddress || this.depositToken.address,
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
      const splitZap = await this.fetchZapSplit(
        splitQuote,
        [withdrawOutput],
        quote.viaToken,
        zapHelpers,
        true
      );
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

  protected async aggregatorTokenSupport() {
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const supportedAggregatorTokens = await swapAggregator.fetchTokenSupport(
      this.possibleTokens.map(option => option.token),
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
                  // disable native as swap target, as zap can't insert balance of native in to call data
                  !isTokenNative(o.token) &&
                  !isTokenEqual(o.token, t) &&
                  supportedAggregatorTokens.tokens[i].length > 1 &&
                  supportedAggregatorTokens.tokens[i].some(t => isTokenEqual(t, o.token))
              ),
            ] as [string, CurveTokenOption[]]
        )
      ),
    };
  }
}

export const CurveStrategy = CurveStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
