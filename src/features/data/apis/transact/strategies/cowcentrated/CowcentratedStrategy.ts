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
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes';
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

  async fetchDepositStep(
    quote: CowcentratedVaultDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { vault } = this.helpers;
    const vaultType = this.helpers.vaultType as CowcentratedVaultType;

    console.log('fetchDepositStep::quote', quote);

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
}
