import type { CowcentratedStrategyOptions, IStrategy, ZapTransactHelpers } from '../IStrategy';
import type {
  CowcentratedDepositOption,
  CowcentratedVaultDepositQuote,
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  TokenAmount,
  WithdrawOption,
  WithdrawQuote,
  ZapQuoteStep,
} from '../../transact-types';
import type { Step } from '../../../../reducers/wallet/stepper';
import type { Namespace, TFunction } from 'react-i18next';
import type { CowcentratedVaultType } from '../../vaults/CowcentratedVaultType';
import { isTokenEqual, isTokenErc20 } from '../../../../entities/token';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
} from '../../helpers/options';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import { BIG_ZERO, bigNumberToStringDeep, fromWei } from '../../../../../../helpers/big-number';
import { selectChainById } from '../../../../selectors/chains';
import { selectVaultStrategyAddress } from '../../../../selectors/vaults';
import { BeefyCLMPool } from '../../../beefy/beefy-clm-pool';
import { selectTokenPriceByAddress } from '../../../../selectors/tokens';
import type { QuoteRequest } from '../../swap/ISwapProvider';
import { first } from 'lodash-es';
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes';

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
    // return this.helpers.vaultType.fetchDepositQuote(inputs, option);

    console.log('fetching deposit quote!');
    console.log(this.helpers);
    const input = onlyOneInput(inputs);

    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Cowcentrated strategy: Quote called with 0 input amount');
    }

    console.log('amount is ok');
    if (option.swapVia === 'aggregator') {
      return this.fetchDepositQuoteAggregator(input, option);
    } else {
      throw new Error('Cowcentrated strategy: Unsupported swap method');
    }
  }

  async fetchDepositStep(quote: DepositQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.helpers.vaultType.fetchDepositStep(quote, t);
  }

  async fetchWithdrawOptions(): Promise<WithdrawOption[]> {
    return [await this.helpers.vaultType.fetchWithdrawOption()];
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: WithdrawOption
  ): Promise<WithdrawQuote> {
    return this.helpers.vaultType.fetchWithdrawQuote(inputs, option);
  }

  async fetchWithdrawStep(quote: WithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.helpers.vaultType.fetchWithdrawStep(quote, t);
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
    console.log('Fetching aggretator quote');
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

    console.log(`Deposit ratios: `, bigNumberToStringDeep(ratios));

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

    console.log('fetchDepositQuoteAggregator::swapInAmounts', bigNumberToStringDeep(swapInAmounts));

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

    console.log(
      'fetchDepositQuoteAggregator::lpTokenAmounts',
      bigNumberToStringDeep(lpTokenAmounts)
    );

    const { liquidity, isCalm } = await clmPool.previewDeposit(
      lpTokenAmounts[0].amount,
      lpTokenAmounts[1].amount
    );
    console.log('Deposit previewed');
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
}
