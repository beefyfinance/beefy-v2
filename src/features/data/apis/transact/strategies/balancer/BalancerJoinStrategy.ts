import type { Namespace, TFunction } from 'react-i18next';
import {
  isTokenEqual,
  isTokenErc20,
  type TokenEntity,
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token';
import type { Step } from '../../../../reducers/wallet/stepper';
import {
  type BalancerPoolDepositOption,
  type BalancerPoolDepositQuote,
  type BalancerPoolWithdrawOption,
  type BalancerPoolWithdrawQuote,
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
import BigNumber from 'bignumber.js';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import type { QuoteRequest } from '../../swap/ISwapProvider';
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
import { isDefined } from '../../../../utils/array-utils';
import { isStandardVaultType, type IStandardVaultType } from '../../vaults/IVaultType';
import type { BalancerJoinStrategyConfig } from '../strategy-configs';
import { type AmmEntityBalancer, isBalancerAmm } from '../../../../entities/zap';
import { selectAmmById } from '../../../../selectors/zap';
import { createFactory } from '../../../../utils/factory-utils';
import type { PoolConfig, VaultConfig } from '../../../amm/balancer/vault/types';
import { GyroEPool } from '../../../amm/balancer/gyroe/GyroEPool';
import { WeightedPool } from '../../../amm/balancer/weighted/WeightedPool';

type ZapHelpers = {
  slippage: number;
  state: BeefyState;
};

const strategyId = 'balancer-join' as const;
type StrategyId = typeof strategyId;

/**
 * Balancer: joinPool() to deposit / exitPool() to withdraw liquidity
 */
class BalancerJoinStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  protected readonly native: TokenNative;
  protected readonly wnative: TokenErc20;
  protected readonly poolTokens: TokenEntity[];
  protected readonly chain: ChainEntity;
  protected readonly depositToken: TokenEntity;
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;
  protected readonly amm: AmmEntityBalancer;

  constructor(
    protected options: BalancerJoinStrategyConfig,
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

    switch (this.options.poolType) {
      case 'gyroe': {
        this.checkPoolTokensCount(2);
        this.checkPoolTokensHavePrice(state);
        break;
      }
      case 'weighted': {
        this.checkPoolTokensHavePrice(state);
        break;
      }
      default: {
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

  protected checkPoolTokensCount(count: number) {
    if (this.poolTokens.length !== count) {
      throw new Error(`There must be exactly ${count} pool tokens`);
    }
  }

  protected checkPoolTokensHavePrice(state: BeefyState) {
    if (
      this.poolTokens.some(token => {
        const price = selectTokenPriceByTokenOracleId(state, token.oracleId);
        return !price || price.lte(BIG_ZERO);
      })
    ) {
      throw new Error('All pool tokens must have a price');
    }
  }

  public async fetchDepositOptions(): Promise<BalancerPoolDepositOption[]> {
    // what tokens can we can zap via pool with
    // const poolTokens = includeNativeAndWrapped(this.poolTokens.map(t => t.token), this.wnative, this.native).map(
    //   token => ({
    //     token,
    //     via: 'pool' as const,
    //   })
    // );

    // what tokens we can zap via swap aggregator with
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const aggregatorTokens = supportedAggregatorTokens
      .filter(token => !isTokenEqual(token, this.vaultType.depositToken))
      .map(token => ({ token, via: 'aggregator' as const }));

    const zapTokens = aggregatorTokens; //[...poolTokens, ...aggregatorTokens];
    const outputs = [this.vaultType.depositToken];

    return zapTokens.map(({ token, via }) => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId(this.id, this.vault.id, selectionId, via),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: 3, //via === 'pool' ? 2 : 3,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId,
        via,
      } as const satisfies BalancerPoolDepositOption;
    });
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
      case 'gyroe': {
        return new GyroEPool(this.chain, vault, pool);
      }
      case 'weighted': {
        return new WeightedPool(this.chain, vault, pool);
      }
      default: {
        throw new Error(`Unsupported balancer pool type ${this.options.poolType}`);
      }
    }
  });

  public async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: BalancerPoolDepositOption
  ): Promise<BalancerPoolDepositQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('BalancerJoinStrategy: Quote called with 0 input amount');
    }

    if (option.via === 'aggregator') {
      return this.fetchDepositQuoteAggregator(input, option);
    } else {
      throw new Error('Unknown zap deposit option via');
      // return this.fetchDepositQuotePool(input, option);
    }
  }

  protected async getSwapAmounts(
    input: TokenAmount
  ): Promise<Array<{ from: TokenAmount; to: TokenEntity }>> {
    const pool = this.getPool();
    const ratios = await pool.getSwapRatios();
    console.debug('ratios', ratios.toString());
    if (ratios.length !== this.poolTokens.length) {
      throw new Error('BalancerJoinStrategy: Ratios length mismatch');
    }

    const inputAmountWei = toWeiFromTokenAmount(input);
    const lastIndex = ratios.length - 1;
    const swapAmounts = ratios.map((ratio, i) =>
      i === lastIndex
        ? BIG_ZERO
        : inputAmountWei.multipliedBy(ratio).integerValue(BigNumber.ROUND_FLOOR)
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

  protected async quoteAddLiquidity(
    inputs: TokenAmount[]
  ): Promise<{ liquidity: TokenAmount; usedInput: TokenAmount[]; unusedInput: TokenAmount[] }> {
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

  protected async fetchDepositQuoteAggregator(
    input: InputTokenAmount,
    option: BalancerPoolDepositOption
  ): Promise<BalancerPoolDepositQuote> {
    const { zap, swapAggregator, getState } = this.helpers;
    const state = getState();

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
    const swapInAmounts = await this.getSwapAmounts(input);

    console.debug(
      'fetchDepositQuoteAggregator::swapInAmounts',
      bigNumberToStringDeep(swapInAmounts)
    );

    // Swap quotes
    const quoteRequestsPerLpToken: (QuoteRequest | undefined)[] = swapInAmounts.map(
      ({ from, to }) =>
        isTokenEqual(from.token, to)
          ? undefined
          : {
              vaultId: this.vault.id,
              fromToken: from.token,
              fromAmount: from.amount,
              toToken: to,
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
      return swapInAmounts[i].from;
    });

    console.debug(
      'fetchDepositQuoteAggregator::lpTokenAmounts',
      bigNumberToStringDeep(lpTokenAmounts)
    );

    const { liquidity, unusedInput } = await this.quoteAddLiquidity(lpTokenAmounts);

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
      outputToken: liquidity.token,
      outputAmount: liquidity.amount,
    });

    steps.push({
      type: 'deposit',
      inputs: [liquidity],
    });

    // Build quote outputs
    const outputs: TokenAmount[] = [liquidity];

    // Build dust outputs
    const returned: TokenAmount[] = unusedInput.filter(input => !input.amount.isZero());

    if (returned.length > 0) {
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
    minInputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { liquidity, usedInput, unusedInput } = await this.quoteAddLiquidity(minInputs);
    const pool = this.getPool();
    const minLiquidity = pool.joinSupportsSlippage
      ? slipTokenAmountBy(liquidity, zapHelpers.slippage)
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
    quote: BalancerPoolDepositQuote,
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
        throw new Error('BalancerJoinStrategy: No build step in quote');
      }

      // since there are two tokens, there must be at least 1 swap
      if (swapQuotes.length < 1) {
        throw new Error('BalancerJoinStrategy: Not enough swaps');
      }

      // Swaps
      if (swapQuotes.length) {
        if (swapQuotes.length > this.poolTokens.length) {
          throw new Error('BalancerJoinStrategy: Too many swaps');
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
        buildQuote.inputs.map(({ token }) => ({
          token,
          amount: minBalances.get(token), // we have to pass min expected in case swaps slipped
        })),
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

  async fetchWithdrawOptions(): Promise<BalancerPoolWithdrawOption[]> {
    const inputs = [this.vaultType.depositToken];

    // what tokens can we can zap via pool with
    // const poolTokens = includeNativeAndWrapped(this.poolTokens.map(t => t.token), this.wnative, this.native).map(
    //   token => ({
    //     token,
    //     via: 'pool' as const,
    //   })
    // );

    // what tokens we can zap via swap aggregator with
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const aggregatorTokens = supportedAggregatorTokens
      .filter(token => !isTokenEqual(token, this.vaultType.depositToken))
      .map(token => ({ token, via: 'aggregator' as const }));

    const zapTokens = aggregatorTokens; //[...poolTokens, ...aggregatorTokens];

    const breakSelectionId = createSelectionId(this.vault.chainId, this.poolTokens);
    const breakOption: BalancerPoolWithdrawOption = {
      id: createOptionId(this.id, this.vault.id, breakSelectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId: breakSelectionId,
      selectionOrder: 2,
      inputs,
      wantedOutputs: this.poolTokens,
      mode: TransactMode.Withdraw,
      strategyId,
      via: 'break-only',
    };

    return [breakOption].concat(
      zapTokens.map(({ token, via }) => {
        const outputs = [token];
        const selectionId = createSelectionId(this.vault.chainId, outputs);

        return {
          id: createOptionId(this.id, this.vault.id, selectionId, via),
          vaultId: this.vault.id,
          chainId: this.vault.chainId,
          selectionId,
          selectionOrder: 3,
          inputs,
          wantedOutputs: outputs,
          mode: TransactMode.Withdraw,
          strategyId,
          via,
        };
      })
    );
  }

  protected async quoteRemoveLiquidity(
    input: TokenAmount
  ): Promise<{ liquidity: TokenAmount; outputs: TokenAmount[] }> {
    const pool = this.getPool();
    const inputAmountWei = toWeiFromTokenAmount(input);
    const result = await pool.quoteRemoveLiquidity(inputAmountWei);

    return {
      liquidity: fromWeiToTokenAmount(result.liquidity, this.depositToken),
      outputs: result.outputs.map((amount, i) => fromWeiToTokenAmount(amount, this.poolTokens[i])),
    };
  }

  protected async fetchWithdrawQuoteAggregator(
    option: BalancerPoolWithdrawOption,
    baseQuote: Pick<BalancerPoolWithdrawQuote, 'outputs' | 'returned' | 'steps'>
  ): Promise<Pick<BalancerPoolWithdrawQuote, 'outputs' | 'returned' | 'steps'>> {
    const { wantedOutputs } = option;
    const { swapAggregator, getState } = this.helpers;
    const state = getState();
    const wantedOutput = onlyOneToken(wantedOutputs);
    const needsSwap = baseQuote.outputs.map(
      tokenAmount => !isTokenEqual(wantedOutput, tokenAmount.token)
    );
    const additionalSteps: BalancerPoolWithdrawQuote['steps'] = [];

    const swapQuotes = await Promise.all(
      baseQuote.outputs.map(async (input, i) => {
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

    let outputTotal = new BigNumber(0);
    baseQuote.outputs.forEach((input, i) => {
      if (needsSwap[i]) {
        const swapQuote = swapQuotes[i];
        if (!swapQuote) {
          throw new Error('No swap quote found');
        }

        outputTotal = outputTotal.plus(swapQuote.toAmount);

        additionalSteps.push({
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

    return {
      ...baseQuote,
      outputs: [{ token: wantedOutput, amount: outputTotal }],
      steps: baseQuote.steps.concat(additionalSteps),
    };
  }

  public async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: BalancerPoolWithdrawOption
  ): Promise<BalancerPoolWithdrawQuote> {
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

    // Common: Token Allowances
    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: zap.manager,
      },
    ];

    // Common: Break the LP
    const removeLiquidityQuote = await this.quoteRemoveLiquidity(liquidityWithdrawn);
    const baseQuote: Pick<BalancerPoolWithdrawQuote, 'outputs' | 'returned' | 'steps'> = {
      steps: [
        {
          type: 'withdraw',
          outputs: [liquidityWithdrawn],
        },
        {
          type: 'split',
          inputToken: liquidityWithdrawn.token,
          inputAmount: liquidityWithdrawn.amount,
          outputs: removeLiquidityQuote.outputs,
        },
      ],
      outputs: removeLiquidityQuote.outputs,
      returned: [],
    };

    let quote: Pick<BalancerPoolWithdrawQuote, 'outputs' | 'returned' | 'steps'>;
    switch (option.via) {
      case 'aggregator': {
        quote = await this.fetchWithdrawQuoteAggregator(option, baseQuote);
        break;
      }
      case 'break-only': {
        quote = baseQuote;
        break;
      }
      default: {
        throw new Error(`Unknown zap withdraw option via ${option.via}`);
      }
    }

    return {
      id: createQuoteId(option.id),
      strategyId: this.id,
      priceImpact: calculatePriceImpact(inputs, quote.outputs, quote.returned, state),
      option,
      inputs,
      allowances,
      fee: highestFeeOrZero(quote.steps),
      ...quote,
    };
  }

  protected async fetchZapSplit(
    quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    zapHelpers: ZapHelpers
  ): Promise<ZapStepResponse> {
    const { slippage } = zapHelpers;
    const input = onlyOneTokenAmount(inputs);
    const { outputs } = await this.quoteRemoveLiquidity(input);
    const minOutputs = outputs.map(output => slipTokenAmountBy(output, slippage));
    const pool = this.getPool();

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

  public async fetchWithdrawStep(
    quote: BalancerPoolWithdrawQuote,
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
    const tokenSupport = await swapAggregator.fetchTokenSupport(
      this.poolTokens,
      this.vault.id,
      this.vault.chainId,
      state,
      this.options.swap
    );

    return tokenSupport.any.filter(aggToken => {
      return this.poolTokens.every(
        (poolToken, i) =>
          isTokenEqual(aggToken, poolToken) ||
          tokenSupport.tokens[i].some(supportedToken => isTokenEqual(supportedToken, aggToken))
      );
    });
  }
}

export const BalancerJoinStrategy =
  BalancerJoinStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
