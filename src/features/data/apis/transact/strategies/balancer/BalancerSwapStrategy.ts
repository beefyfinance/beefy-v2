import type { Namespace, TFunction } from 'react-i18next';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  type TokenEntity,
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token';
import type { Step } from '../../../../reducers/wallet/stepper';
import {
  type BalancerSwapDepositOption,
  type BalancerSwapDepositQuote,
  type BalancerSwapWithdrawOption,
  type BalancerSwapWithdrawQuote,
  type InputTokenAmount,
  isZapQuoteStepBuild,
  isZapQuoteStepSplit,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepWithdraw,
  type TokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepBuild,
  type ZapQuoteStepSplit,
  type ZapQuoteStepSwap,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types';
import type { IZapStrategy, IZapStrategyStatic, ZapTransactHelpers } from '../IStrategy';
import type { ChainEntity } from '../../../../entities/chain';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
  onlyOneToken,
  onlyOneTokenAmount,
} from '../../helpers/options';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenByAddressOrUndefined,
  selectTokenPriceByTokenOracleId,
} from '../../../../selectors/tokens';
import { selectChainById } from '../../../../selectors/chains';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import { first, uniqBy } from 'lodash-es';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
  fromWei,
  fromWeiToTokenAmount,
  toWeiFromTokenAmount,
  toWeiString,
} from '../../../../../../helpers/big-number';
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes';
import type BigNumber from 'bignumber.js';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import type { BalancerTokenOption } from './types';
import type { QuoteResponse } from '../../swap/ISwapProvider';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepResponse,
} from '../../zap/types';
import { fetchZapAggregatorSwap } from '../../zap/swap';
import { selectTransactSlippage } from '../../../../selectors/transact';
import { Balances } from '../../helpers/Balances';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap';
import { slipBy, slipTokenAmountBy } from '../../helpers/amounts';
import { allTokensAreDistinct, pickTokens } from '../../helpers/tokens';
import { walletActions } from '../../../../actions/wallet-actions';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault';
import { getVaultWithdrawnFromState } from '../../helpers/vault';
import { isFulfilledResult } from '../../../../../../helpers/promises';
import { isDefined } from '../../../../utils/array-utils';
import { isStandardVaultType, type IStandardVaultType } from '../../vaults/IVaultType';
import type { BalancerSwapStrategyConfig } from '../strategy-configs';
import { ComposableStablePool } from '../../../amm/balancer/composable-stable/ComposableStablePool';
import { type AmmEntityBalancer, isBalancerAmm } from '../../../../entities/zap';
import { selectAmmById } from '../../../../selectors/zap';
import { createFactory } from '../../../../utils/factory-utils';
import type { PoolConfig, VaultConfig } from '../../../amm/balancer/vault/types';

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
  via: BalancerTokenOption;
  /** Quote for swapping to/from coin if required */
  quote?: QuoteResponse;
};

type WithdrawLiquidity = DepositLiquidity & {
  /** How much token we have after the split */
  split: TokenAmount;
};

const strategyId = 'balancer-swap' as const;
type StrategyId = typeof strategyId;

/**
 * Balancer: swap() to deposit/withdraw liquidity
 */
class BalancerSwapStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected readonly native: TokenNative;
  protected readonly wnative: TokenErc20;
  protected readonly possibleTokens: BalancerTokenOption[];
  protected readonly chain: ChainEntity;
  protected readonly depositToken: TokenEntity;
  protected readonly poolTokens: TokenEntity[];
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;
  protected readonly amm: AmmEntityBalancer;

  constructor(
    protected options: BalancerSwapStrategyConfig,
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
    this.possibleTokens = this.selectAvailableTokens(state, this.poolTokens);

    if (this.options.poolType === 'composable-stable') {
      if (!this.possibleTokens.length) {
        throw new Error(
          `Vault ${vault.id}: At least one token must be in address book and priced for ${this.options.poolType}`
        );
      }
    } else {
      throw new Error(`Unsupported balancer pool type ${this.options.poolType}`);
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

  /**
   * Tokens are available so long as they are in the address book and have a price
   */
  protected selectAvailableTokens(
    state: BeefyState,
    poolTokens: TokenEntity[]
  ): BalancerTokenOption[] {
    return poolTokens
      .map((token, i) => {
        const price = selectTokenPriceByTokenOracleId(state, token.oracleId);
        if (!price || price.lte(BIG_ZERO)) {
          return undefined;
        }

        return {
          index: i,
          token,
          price,
        };
      })
      .filter(isDefined)
      .filter(t => !isTokenEqual(t.token, this.depositToken));
  }

  public async fetchDepositOptions(): Promise<BalancerSwapDepositOption[]> {
    const outputs = [this.vaultType.depositToken];

    const baseOptions: BalancerSwapDepositOption[] = this.possibleTokens.map(depositToken => {
      const inputs = [depositToken.token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, 'direct'),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: 2,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId,
        via: 'direct',
        viaToken: depositToken,
      };
    });

    const { any: allAggregatorTokens, map: tokenToDepositTokens } =
      await this.aggregatorTokenSupport();

    const aggregatorOptions: BalancerSwapDepositOption[] = allAggregatorTokens
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
          selectionOrder: 3,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Deposit,
          strategyId,
          via: 'aggregator',
          viaTokens: possible,
        };
      });

    return baseOptions.concat(aggregatorOptions);
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
      case 'composable-stable': {
        return new ComposableStablePool(this.chain, vault, pool);
      }
      default: {
        throw new Error(`Unsupported balancer pool type ${this.options.poolType}`);
      }
    }
  });

  protected async quoteAddLiquidityOneToken(input: TokenAmount): Promise<TokenAmount> {
    const pool = this.getPool();
    const liquidity = await pool.quoteAddLiquidityOneToken(
      input.token.address,
      toWeiFromTokenAmount(input)
    );
    return fromWeiToTokenAmount(liquidity, this.depositToken);
  }

  protected async getDepositLiquidityDirect(
    input: InputTokenAmount,
    depositVia: BalancerTokenOption
  ): Promise<DepositLiquidity> {
    if (!isTokenEqual(input.token, depositVia.token)) {
      throw new Error(
        `Balancer strategy: Direct deposit called with input token ${input.token.symbol} but expected ${depositVia.token.symbol}`
      );
    }

    return {
      input,
      output: await this.quoteAddLiquidityOneToken(input),
      via: depositVia,
    };
  }

  protected async getDepositLiquidityAggregator(
    state: BeefyState,
    input: InputTokenAmount,
    depositVias: BalancerTokenOption[]
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
          state
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
        const input = { token: quote.toToken, amount: quote.toAmount };
        return {
          via,
          quote,
          input,
          output: await this.quoteAddLiquidityOneToken(input),
        };
      })
    );

    // sort by most liquidity
    withLiquidity.sort((a, b) => b.output.amount.comparedTo(a.output.amount));

    // Get the one which gives the most liquidity
    return withLiquidity[0];
  }

  protected async getDepositLiquidity(
    state: BeefyState,
    input: InputTokenAmount,
    option: BalancerSwapDepositOption
  ): Promise<DepositLiquidity> {
    if (option.via === 'direct') {
      return this.getDepositLiquidityDirect(input, option.viaToken);
    }
    return this.getDepositLiquidityAggregator(state, input, option.viaTokens);
  }

  public async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: BalancerSwapDepositOption
  ): Promise<BalancerSwapDepositQuote> {
    const { zap, getState } = this.helpers;
    const state = getState();
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('BalancerStrategy: Quote called with 0 input amount');
    }

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
      strategyId,
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
    quoteStep: ZapQuoteStepBuild,
    depositVia: BalancerTokenOption,
    minInputAmount: BigNumber,
    zapHelpers: ZapHelpers,
    insertBalance: boolean = false
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const input = { token: depositVia.token, amount: minInputAmount };
    const liquidity = await this.quoteAddLiquidityOneToken(input);
    const minLiquidity = slipTokenAmountBy(liquidity, slippage);
    const pool = this.getPool();

    return {
      inputs: [input],
      outputs: [liquidity],
      minOutputs: [minLiquidity],
      returned: [],
      zaps: [
        await pool.getAddLiquidityOneTokenZap(
          input.token.address,
          toWeiFromTokenAmount(input),
          toWeiFromTokenAmount(minLiquidity),
          this.helpers.zap.router,
          insertBalance
        ),
      ],
    };
  }

  public async fetchDepositStep(
    quote: BalancerSwapDepositQuote,
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
        poolAddress: this.depositToken.address,
      };
      const steps: ZapStep[] = [];
      const minBalances = new Balances(quote.inputs);
      const swapQuotes = quote.steps.filter(isZapQuoteStepSwap);
      const buildQuote = quote.steps.find(isZapQuoteStepBuild);

      if (!buildQuote) {
        throw new Error('BalancerStrategy: No build step in quote');
      }

      // wrap and asset swap, 2 max
      if (swapQuotes.length > 2) {
        throw new Error('BalancerStrategy: Too many swaps');
      }

      // Swaps
      if (swapQuotes.length) {
        if (swapQuotes.length > 1) {
          throw new Error('BalancerStrategy: Too many swaps in quote');
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

  async fetchWithdrawOptions(): Promise<BalancerSwapWithdrawOption[]> {
    const inputs = [this.vaultType.depositToken];

    const baseOptions: BalancerSwapWithdrawOption[] = this.possibleTokens.map(depositToken => {
      const outputs = [depositToken.token];
      const selectionId = createSelectionId(this.vault.chainId, outputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, 'direct'),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: 2,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        strategyId,
        via: 'direct',
        viaToken: depositToken,
      };
    });

    const { any: allAggregatorTokens, map: tokenToDepositTokens } =
      await this.aggregatorTokenSupport();

    const aggregatorOptions: BalancerSwapWithdrawOption[] = allAggregatorTokens
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
          selectionOrder: 3,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Withdraw,
          strategyId,
          via: 'aggregator',
          viaTokens: possible,
        };
      });

    return baseOptions.concat(aggregatorOptions);
  }

  protected async quoteRemoveLiquidityOneToken(
    input: TokenAmount,
    wanted: TokenEntity
  ): Promise<TokenAmount> {
    const pool = this.getPool();
    const amountOut = await pool.quoteRemoveLiquidityOneToken(
      toWeiFromTokenAmount(input),
      wanted.address
    );
    return fromWeiToTokenAmount(amountOut, wanted);
  }

  protected async getWithdrawLiquidityDirect(
    input: TokenAmount,
    wanted: TokenEntity,
    withdrawVia: BalancerTokenOption
  ): Promise<WithdrawLiquidity> {
    if (!isTokenEqual(wanted, withdrawVia.token)) {
      throw new Error(
        `Balancer strategy: Direct withdraw called with wanted token ${input.token.symbol} but expected ${withdrawVia.token.symbol}`
      );
    }

    const split = await this.quoteRemoveLiquidityOneToken(input, wanted);

    // no further steps so output is same as split
    return {
      input,
      split,
      output: split,
      via: withdrawVia,
    };
  }

  protected async getWithdrawLiquidityAggregator(
    state: BeefyState,
    input: TokenAmount,
    wanted: TokenEntity,
    withdrawVias: BalancerTokenOption[]
  ): Promise<WithdrawLiquidity> {
    const { swapAggregator } = this.helpers;
    const slippage = selectTransactSlippage(state);

    // Fetch withdraw liquidity quotes for each possible withdraw via token
    const quotes = await Promise.all(
      withdrawVias.map(async withdrawVia => {
        const split = await this.quoteRemoveLiquidityOneToken(input, withdrawVia.token);
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
          state
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
    withSwaps.sort((a, b) => b.output.amount.comparedTo(a.output.amount));

    // Get the one which gives the most output
    return withSwaps[0];
  }

  protected async getWithdrawLiquidity(
    state: BeefyState,
    input: TokenAmount,
    wanted: TokenEntity,
    option: BalancerSwapWithdrawOption
  ): Promise<WithdrawLiquidity> {
    if (option.via === 'direct') {
      return this.getWithdrawLiquidityDirect(input, wanted, option.viaToken);
    }
    return this.getWithdrawLiquidityAggregator(state, input, wanted, option.viaTokens);
  }

  public async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: BalancerSwapWithdrawOption
  ): Promise<BalancerSwapWithdrawQuote> {
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
      strategyId,
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
    quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    via: BalancerTokenOption,
    zapHelpers: ZapHelpers,
    insertBalance: boolean = false
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const input = onlyOneTokenAmount(inputs);
    const output = await this.quoteRemoveLiquidityOneToken(input, via.token);
    const minOutput = slipTokenAmountBy(output, slippage);
    const pool = this.getPool();

    return {
      inputs,
      outputs: [output],
      minOutputs: [minOutput],
      returned: [],
      zaps: [
        await pool.getRemoveLiquidityOneTokenZap(
          toWeiFromTokenAmount(input),
          output.token.address,
          toWeiFromTokenAmount(minOutput),
          this.helpers.zap.router,
          insertBalance
        ),
      ],
    };
  }

  public async fetchWithdrawStep(
    quote: BalancerSwapWithdrawQuote,
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
        poolAddress: this.depositToken.address,
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
            ] as [string, BalancerTokenOption[]]
        )
      ),
    };
  }
}

export const BalancerSwapStrategy =
  BalancerSwapStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
