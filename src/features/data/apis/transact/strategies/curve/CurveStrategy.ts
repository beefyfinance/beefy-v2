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
  type TokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepBuild,
  type ZapQuoteStepSplit,
  type ZapQuoteStepSwap,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types';
import type { CurveStrategyOptions, IStrategy, TransactHelpers } from '../IStrategy';
import type { ChainEntity } from '../../../../entities/chain';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
  onlyVaultStandard,
} from '../../helpers/options';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenByAddressOrNull,
  selectTokenPriceByTokenOracleId,
} from '../../../../selectors/tokens';
import { selectChainById } from '../../../../selectors/chains';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import { first, uniqBy } from 'lodash-es';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
  fromWei,
  fromWeiString,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number';
import { calculatePriceImpact, highestFeeOrZero } from '../../helpers/quotes';
import type BigNumber from 'bignumber.js';
import { getWeb3Instance } from '../../../instances';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import { type CurveMethod, type CurveTokenOption, getMethodSignaturesForType } from './types';
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
import type { AbiItem } from 'web3-utils';
import abiCoder from 'web3-eth-abi';
import { getInsertIndex, getTokenAddress, NO_RELAY } from '../../helpers/zap';
import { slipBy } from '../../helpers/amounts';
import { allTokensAreDistinct, pickTokens } from '../../helpers/tokens';
import { walletActions } from '../../../../actions/wallet-actions';
import { isStandardVault } from '../../../../entities/vault';
import { getVaultWithdrawnFromState } from '../../helpers/vault';

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

// TODO remove
/* eslint-disable @typescript-eslint/no-unused-vars */

export class CurveStrategy implements IStrategy {
  public readonly id = 'curve';
  protected readonly native: TokenNative;
  protected readonly wnative: TokenErc20;
  protected readonly possibleTokens: CurveTokenOption[];
  protected readonly chain: ChainEntity;
  protected readonly depositToken: TokenEntity;
  protected readonly poolAddress: string;

  constructor(protected options: CurveStrategyOptions, protected helpers: TransactHelpers) {
    const { vault, vaultType, getState } = this.helpers;

    onlyVaultStandard(vault);

    const state = getState();
    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        throw new Error(`Vault ${vault.id}: Asset ${vault.assetIds[i]} not loaded`);
      }
    }

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
    return uniqBy(
      methods
        .flatMap(option =>
          option.coins.map((address, i) => {
            const token = selectTokenByAddressOrNull(state, chainId, address);
            return {
              type: option.type,
              target: option.target,
              index: i,
              numCoins: option.coins.length,
              token,
              price: token && selectTokenPriceByTokenOracleId(state, token.oracleId),
            };
          })
        )
        .filter(option => !!option.token && option.price && option.price.gt(BIG_ZERO)),
      option => `${option.token.chainId} -${option.token.address}`
    );
  }

  public async fetchDepositOptions(): Promise<CurveDepositOption[]> {
    const { vault, vaultType } = this.helpers;
    const outputs = [vaultType.depositToken];

    const baseOptions: CurveDepositOption[] = this.possibleTokens.map(depositToken => {
      const inputs = [depositToken.token];
      const selectionId = createSelectionId(vault.chainId, inputs);

      return {
        id: createOptionId(this.id, vault.id, selectionId, 'direct'),
        vaultId: vault.id,
        chainId: vault.chainId,
        selectionId,
        selectionOrder: 2,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Deposit,
        strategyId: 'curve',
        via: 'direct',
        viaToken: depositToken,
      };
    });

    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const tokenToDepositTokens = Object.fromEntries(
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
    );

    const aggregatorOptions: CurveDepositOption[] = supportedAggregatorTokens.any
      .filter(token => tokenToDepositTokens[token.address].length > 0)
      .map(token => {
        const inputs = [token];
        const selectionId = createSelectionId(vault.chainId, inputs);
        const possible = tokenToDepositTokens[token.address];

        if (possible.length === 0) {
          console.error({ vault: vault.id, token, possible });
          throw new Error(`No other tokens supported for ${token.symbol}`);
        }

        return {
          id: createOptionId(this.id, vault.id, selectionId, 'aggregator'),
          vaultId: vault.id,
          chainId: vault.chainId,
          selectionId,
          selectionOrder: 3,
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

  /** calc_token_amount abi */
  protected typeToAddLiquidityQuoteAbi(type: CurveTokenOption['type'], numCoins: number): AbiItem {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(type, signatures.depositQuote, numCoins);
  }

  /** add_liquidity abi */
  protected typeToAddLiquidityAbi(type: CurveTokenOption['type'], numCoins: number): AbiItem {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(type, signatures.deposit, numCoins, 'payable');
  }

  protected typeToAddLiquidityQuoteParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amounts: string[]
  ): unknown[] {
    switch (type) {
      case 'fixed':
        return [amounts];
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
      case 'fixed-deposit-underlying':
        return [amounts, true];
      case 'pool-fixed':
        return [poolAddress, amounts];
      case 'pool-fixed-deposit':
        return [poolAddress, amounts, true];
      default:
        throw new Error(`Invalid deposit type ${type}`);
    }
  }

  protected typeToAddLiquidityParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amounts: string[],
    minMintAmount: string,
    beefyRouter: string
  ): unknown[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
        return [amounts, minMintAmount];
      case 'fixed-deposit-underlying':
        return [amounts, minMintAmount, true];
      case 'pool-fixed':
      case 'pool-fixed-deposit':
        return [poolAddress, amounts, minMintAmount];
      default:
        throw new Error(`Invalid deposit type ${type}`);
    }
  }

  protected typeToAddLiquidityTokenIndexes(
    type: CurveTokenOption['type'],
    amounts: string[]
  ): number[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'fixed-deposit-underlying':
        // amounts[N_COINS] is first param, so array index N is at offset N
        return amounts.map((_, i) => getInsertIndex(i));
      case 'dynamic-deposit':
        // amounts[] is first param, but its dynamic array
        // 0   offset to array
        // 1   min_amount
        // 2   array length
        // 3   array 0
        // 4   array 1
        // N+3 array N
        return amounts.map((_, i) => getInsertIndex(3 + i));
      case 'pool-fixed':
      case 'pool-fixed-deposit':
        // amounts[N_COINS] is second param, so array index N is at offset N+1
        return amounts.map((_, i) => getInsertIndex(1 + i));
      default:
        throw new Error(`Invalid deposit type ${type}`);
    }
  }

  protected signatureToAbiItem(
    type: CurveTokenOption['type'],
    signature: string,
    numCoins: number,
    stateMutability: 'payable' | 'view' = 'view'
  ): AbiItem {
    const [name, inputsPart] = signature.split(':');
    const inputs = inputsPart.split('/');

    return {
      type: 'function',
      name,
      stateMutability,
      inputs: inputs.map(input => {
        switch (input) {
          case 'fixed_amounts':
            return {
              name: 'amounts',
              type: `uint256[${numCoins}]`,
            };
          case 'dynamic_amounts':
            return {
              name: 'amounts',
              type: `uint256[]`,
            };
          case 'amount':
          case 'min_amount':
            return {
              name: input,
              type: 'uint256',
            };
          case 'uint256_index':
            return {
              name: 'index',
              type: 'uint256',
            };
          case 'int128_index':
            return {
              name: 'index',
              type: 'int128',
            };
          case 'is_deposit':
          case 'use_underlying':
            return {
              name: input,
              type: 'bool',
            };
          case 'pool':
            return {
              name: input,
              type: 'address',
            };
          default:
            throw new Error(`Invalid input type ${input}`);
        }
      }),
      outputs: [
        {
          name: 'amount',
          type: 'uint256',
        },
      ],
    };
  }

  protected typeToAbi(type: CurveTokenOption['type'], numCoins: number): AbiItem[] {
    const signatures = getMethodSignaturesForType(type);
    return Object.values(signatures).map(signature =>
      this.signatureToAbiItem(type, signature, numCoins)
    );
  }

  protected async quoteAddLiquidity(
    poolAddress: string,
    depositAmount: BigNumber,
    deposit: CurveTokenOption
  ): Promise<TokenAmount> {
    const web3 = await getWeb3Instance(this.chain);
    const contract = new web3.eth.Contract(
      [this.typeToAddLiquidityQuoteAbi(deposit.type, deposit.numCoins)],
      deposit.target
    );
    const amounts = this.makeAmounts(
      toWeiString(depositAmount, deposit.token.decimals),
      deposit.index,
      deposit.numCoins
    );

    const params = this.typeToAddLiquidityQuoteParams(deposit.type, poolAddress, amounts);
    console.log(deposit.type, deposit.target, 'calc_token_amount', params);
    const amount = await contract.methods.calc_token_amount(...params).call();
    console.log('->', amount);

    return {
      token: this.depositToken,
      amount: fromWeiString(amount, this.depositToken.decimals),
    };
  }

  protected async getDepositLiquidityDirect(
    state: BeefyState,
    poolAddress: string,
    input: InputTokenAmount,
    depositVia: CurveTokenOption
  ): Promise<DepositLiquidity> {
    if (!isTokenEqual(input.token, depositVia.token)) {
      throw new Error(
        `Curve strategy: Direct deposit called with input token ${input.token.symbol} but expected ${depositVia.token.symbol}`
      );
    }

    const output = await this.quoteAddLiquidity(poolAddress, input.amount, depositVia);
    return { input, output, via: depositVia };
  }

  protected async getDepositLiquidityAggregator(
    state: BeefyState,
    poolAddress: string,
    input: InputTokenAmount,
    depositVias: CurveTokenOption[]
  ): Promise<DepositLiquidity> {
    const { vault, swapAggregator } = this.helpers;

    // Fetch quotes from input token, to each possible deposit via token
    const quotes = await Promise.all(
      depositVias.map(async depositVia => {
        const quotes = await swapAggregator.fetchQuotes(
          {
            vaultId: vault.id,
            fromToken: input.token,
            fromAmount: input.amount,
            toToken: depositVia.token,
          },
          state
        );
        return { via: depositVia, quote: first(quotes) };
      })
    );

    // For the best quote per deposit via token, calculate how much liquidity we get
    const withLiquidity = await Promise.all(
      quotes.map(async ({ via, quote }) => {
        return {
          via,
          quote,
          input: { token: quote.toToken, amount: quote.toAmount },
          output: await this.quoteAddLiquidity(poolAddress, quote.toAmount, via),
        };
      })
    );

    // sort by most liquidity
    withLiquidity.sort((a, b) => b.output.amount.comparedTo(a.output.amount));

    // debug
    withLiquidity.forEach(({ via, quote, input, output }) =>
      console.log({
        via: via.token.symbol,
        liquidity: output.amount.toString(10),
      })
    );

    // Get the one which gives the most liquidity
    return first(withLiquidity);
  }

  protected async getDepositLiquidity(
    state: BeefyState,
    poolAddress: string,
    input: InputTokenAmount,
    option: CurveDepositOption
  ): Promise<DepositLiquidity> {
    if (option.via === 'direct') {
      return this.getDepositLiquidityDirect(state, poolAddress, input, option.viaToken);
    }
    return this.getDepositLiquidityAggregator(state, poolAddress, input, option.viaTokens);
  }

  public async fetchDepositQuote(
    inputs: InputTokenAmount<TokenEntity>[],
    option: CurveDepositOption
  ): Promise<CurveDepositQuote> {
    onlyInputCount(inputs, 1);

    const { zap, vault, swapAggregator, getState } = this.helpers;
    const state = getState();
    const input = first(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Curve strategy: Quote called with 0 input amount');
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
    const poolAddress = this.options.poolAddress || this.depositToken.address;
    const depositLiquidity = await this.getDepositLiquidity(state, poolAddress, input, option);

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
      token: depositLiquidity.output.token,
      amount: depositLiquidity.output.amount,
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

  protected makeAmounts(amount: string, index: number, numCoins: number): string[] {
    const amounts = Array<string>(numCoins).fill('0');
    amounts[index] = amount;
    return amounts;
  }

  protected buildZapAddLiquidityTx(
    poolAddress: string,
    depositVia: CurveTokenOption,
    depositAmountWei: BigNumber,
    minLiquidityWei: BigNumber,
    receiver: string,
    insertBalance: boolean
  ): ZapStep {
    const amountsWei = this.makeAmounts(
      depositAmountWei.toString(10),
      depositVia.index,
      depositVia.numCoins
    );
    const tokenIndexes = this.typeToAddLiquidityTokenIndexes(depositVia.type, amountsWei);
    const isNative = isTokenNative(depositVia.token);

    const methodAbi = this.typeToAddLiquidityAbi(depositVia.type, depositVia.numCoins);
    const methodParams = this.typeToAddLiquidityParams(
      depositVia.type,
      poolAddress,
      amountsWei,
      minLiquidityWei.toString(10),
      receiver
    );

    return {
      target: depositVia.target,
      value: isNative ? depositAmountWei.toString(10) : '0',
      data: abiCoder.encodeFunctionCall(methodAbi, methodParams),
      tokens: insertBalance
        ? [
            {
              token: getTokenAddress(depositVia.token),
              index: tokenIndexes[depositVia.index],
            },
          ]
        : [],
    };
  }

  protected async fetchZapBuild(
    quoteStep: ZapQuoteStepBuild,
    depositVia: CurveTokenOption,
    minInputAmount: BigNumber,
    zapHelpers: ZapHelpers,
    insertBalance: boolean = false
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage } = zapHelpers;
    const poolAddress = this.options.poolAddress || this.depositToken.address;
    const liquidity = await this.quoteAddLiquidity(poolAddress, minInputAmount, depositVia);
    const minLiquidity = slipBy(liquidity.amount, slippage, liquidity.token.decimals);
    console.log(bigNumberToStringDeep({ liquidity, minLiquidity }));

    // we can't do this check as the above liquidity quote is using min amounts as input
    // TODO but maybe we should set the min output to that of the quote; or full amount of above liquidity
    // if (liquidity.amount.lt(quoteStep.outputAmount)) {
    //   throw new QuoteChangedError(`Expected liquidity created changed between quote and execution`);
    // }

    return {
      inputs: [{ token: depositVia.token, amount: minInputAmount }],
      outputs: [liquidity],
      minOutputs: [{ token: liquidity.token, amount: minLiquidity }],
      returned: [],
      zaps: [
        this.buildZapAddLiquidityTx(
          poolAddress,
          depositVia,
          toWei(minInputAmount, depositVia.token.decimals),
          toWei(minLiquidity, liquidity.token.decimals),
          zap.router,
          insertBalance
        ),
      ],
    };
  }

  public async fetchDepositStep(
    quote: CurveDepositQuote,
    t: TFunction<Namespace<string>>
  ): Promise<Step> {
    const { vault, vaultType } = this.helpers;
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, vault.chainId);
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

      // wrap and asset swap, 2 max
      if (swapQuotes.length > 2) {
        throw new Error('CurveStrategy: Too many swaps');
      }

      // Swaps
      if (swapQuotes.length) {
        const swapQuote = first(swapQuotes);
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
      const vaultDeposit = await vaultType.fetchZapDeposit({
        inputs: [
          {
            token: buildQuote.outputToken,
            amount: minBalances.get(buildQuote.outputToken), // min expected in case add liquidity slipped
            max: true, // but we call depositAll
          },
        ],
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

  async fetchWithdrawOptions(): Promise<CurveWithdrawOption[]> {
    const { vault, vaultType } = this.helpers;
    const inputs = [vaultType.depositToken];

    const baseOptions: CurveWithdrawOption[] = this.possibleTokens.map(depositToken => {
      const outputs = [depositToken.token];
      const selectionId = createSelectionId(vault.chainId, outputs);

      return {
        id: createOptionId(this.id, vault.id, selectionId, 'direct'),
        vaultId: vault.id,
        chainId: vault.chainId,
        selectionId,
        selectionOrder: 2,
        inputs,
        wantedOutputs: outputs,
        mode: TransactMode.Withdraw,
        strategyId: 'curve',
        via: 'direct',
        viaToken: depositToken,
      };
    });

    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const tokenToDepositTokens = Object.fromEntries(
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
    );

    const aggregatorOptions: CurveWithdrawOption[] = supportedAggregatorTokens.any
      .filter(token => tokenToDepositTokens[token.address].length > 0)
      .map(token => {
        const outputs = [token];
        const selectionId = createSelectionId(vault.chainId, outputs);
        const possible = tokenToDepositTokens[token.address];

        if (possible.length === 0) {
          console.error({ vault: vault.id, token, possible });
          throw new Error(`No other tokens supported for ${token.symbol}`);
        }

        return {
          id: createOptionId(this.id, vault.id, selectionId, 'aggregator'),
          vaultId: vault.id,
          chainId: vault.chainId,
          selectionId,
          selectionOrder: 3,
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

  /** calc_withdraw_one_coin abi */
  protected typeToRemoveLiquidityQuoteAbi(
    type: CurveTokenOption['type'],
    numCoins: number
  ): AbiItem {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(type, signatures.withdrawQuote, numCoins);
  }

  /** remove_liquidity_one_coin abi */
  protected typeToRemoveLiquidityAbi(type: CurveTokenOption['type'], numCoins: number): AbiItem {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(type, signatures.withdraw, numCoins, 'payable');
  }

  protected typeToRemoveLiquidityQuoteParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amount: string,
    tokenIndex: number
  ): unknown[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
      case 'fixed-deposit-underlying':
        return [amount, tokenIndex];
      case 'pool-fixed':
      case 'pool-fixed-deposit':
        return [poolAddress, amount, tokenIndex];
      default:
        throw new Error(`Invalid withdraw type ${type}`);
    }
  }

  protected typeToRemoveLiquidityParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amount: string,
    tokenIndex: number,
    minAmount: string
  ): unknown[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
        return [amount, tokenIndex, minAmount];
      case 'fixed-deposit-underlying':
        return [amount, tokenIndex, minAmount, true];
      case 'pool-fixed':
      case 'pool-fixed-deposit':
        return [poolAddress, amount, tokenIndex, minAmount];
      default:
        throw new Error(`Invalid withdraw type ${type}`);
    }
  }

  protected typeToRemoveLiquidityTokenIndex(type: CurveTokenOption['type']): number {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
      case 'fixed-deposit-underlying':
        // 0: amount
        // 1: index
        // 2: min_amount
        // [3: use_underlying]
        return getInsertIndex(0);
      case 'pool-fixed':
      case 'pool-fixed-deposit':
        // 0: pool
        // 1: amount
        // 2: index
        // 3: min_amount
        return getInsertIndex(1);
      default:
        throw new Error(`Invalid withdraw type ${type}`);
    }
  }

  protected async quoteRemoveLiquidity(
    poolAddress: string,
    withdrawAmount: BigNumber,
    withdraw: CurveTokenOption
  ): Promise<TokenAmount> {
    const web3 = await getWeb3Instance(this.chain);
    const contract = new web3.eth.Contract(
      [this.typeToRemoveLiquidityQuoteAbi(withdraw.type, withdraw.numCoins)],
      withdraw.target
    );
    const amount = toWeiString(withdrawAmount, this.depositToken.decimals);
    const params = this.typeToRemoveLiquidityQuoteParams(
      withdraw.type,
      poolAddress,
      amount,
      withdraw.index
    );
    console.log(withdraw.type, withdraw.target, 'calc_withdraw_one_coin', params);
    const withdrawn = await contract.methods.calc_withdraw_one_coin(...params).call();
    console.log('->', withdrawn);

    return {
      token: withdraw.token,
      amount: fromWeiString(withdrawn, withdraw.token.decimals),
    };
  }

  protected async getWithdrawLiquidityDirect(
    state: BeefyState,
    poolAddress: string,
    input: TokenAmount,
    wanted: TokenEntity,
    withdrawVia: CurveTokenOption
  ): Promise<WithdrawLiquidity> {
    if (!isTokenEqual(wanted, withdrawVia.token)) {
      throw new Error(
        `Curve strategy: Direct withdraw called with wanted token ${input.token.symbol} but expected ${withdrawVia.token.symbol}`
      );
    }

    const split = await this.quoteRemoveLiquidity(poolAddress, input.amount, withdrawVia);

    // no further steps so output is same as split
    return { input, split, output: split, via: withdrawVia };
  }

  protected async getWithdrawLiquidityAggregator(
    state: BeefyState,
    poolAddress: string,
    input: TokenAmount,
    wanted: TokenEntity,
    withdrawVias: CurveTokenOption[]
  ): Promise<WithdrawLiquidity> {
    const { vault, swapAggregator } = this.helpers;

    // Fetch withdraw liquidity quotes for each possible withdraw via token
    const quotes = await Promise.all(
      withdrawVias.map(async withdrawVia => {
        const split = await this.quoteRemoveLiquidity(poolAddress, input.amount, withdrawVia);
        return { via: withdrawVia, split };
      })
    );

    // Fetch swap quote between withdrawn token and wanted token
    const withSwaps = await Promise.all(
      quotes.map(async ({ via, split }) => {
        const quotes = await swapAggregator.fetchQuotes(
          {
            vaultId: vault.id,
            fromToken: split.token,
            fromAmount: split.amount,
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

    // debug
    withSwaps.forEach(({ via, quote, input, output }) =>
      console.log({
        via: via.token.symbol,
        output: output.amount.toString(10),
      })
    );

    // Get the one which gives the most output
    return first(withSwaps);
  }

  protected async getWithdrawLiquidity(
    state: BeefyState,
    poolAddress: string,
    input: TokenAmount,
    wanted: TokenEntity,
    option: CurveWithdrawOption
  ): Promise<WithdrawLiquidity> {
    if (option.via === 'direct') {
      return this.getWithdrawLiquidityDirect(state, poolAddress, input, wanted, option.viaToken);
    }
    return this.getWithdrawLiquidityAggregator(state, poolAddress, input, wanted, option.viaTokens);
  }

  public async fetchWithdrawQuote(
    inputs: InputTokenAmount<TokenEntity>[],
    option: CurveWithdrawOption
  ): Promise<CurveWithdrawQuote> {
    onlyInputCount(inputs, 1);

    const input = first(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    if (option.wantedOutputs.length !== 1) {
      throw new Error('Can only swap to 1 output token');
    }

    const { vault, vaultType, zap, getState } = this.helpers;
    if (!isStandardVault(vault)) {
      throw new Error('Vault is not standard');
    }

    // Common: Withdraw from vault
    const state = getState();
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, vault, state);
    const withdrawnAmountAfterFee = fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals);
    const liquidityWithdrawn = { amount: withdrawnAmountAfterFee, token: withdrawnToken };
    const wantedToken = first(option.wantedOutputs);

    // Common: Token Allowances
    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: zap.manager,
      },
    ];

    // Fetch remove liquidity (and swap quote if aggregator)
    const poolAddress = this.options.poolAddress || this.depositToken.address;
    const withdrawnLiquidity = await this.getWithdrawLiquidity(
      state,
      poolAddress,
      liquidityWithdrawn,
      wantedToken,
      option
    );

    // Build quote steps
    const steps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        token: vaultType.depositToken,
        amount: withdrawnAmountAfterFee,
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
    }

    const outputs: TokenAmount[] = [withdrawnLiquidity.output];
    const returned: TokenAmount[] = [];

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

  protected buildZapRemoveLiquidityTx(
    poolAddress: string,
    withdrawVia: CurveTokenOption,
    withdrawAmountWei: BigNumber,
    minOutputWei: BigNumber,
    receiver: string,
    insertBalance: boolean
  ): ZapStep {
    const methodAbi = this.typeToRemoveLiquidityAbi(withdrawVia.type, withdrawVia.numCoins);
    const methodParams = this.typeToRemoveLiquidityParams(
      withdrawVia.type,
      poolAddress,
      withdrawAmountWei.toString(10),
      withdrawVia.index,
      minOutputWei.toString(10)
    );

    return {
      target: withdrawVia.target,
      value: '0',
      data: abiCoder.encodeFunctionCall(methodAbi, methodParams),
      tokens: insertBalance
        ? [
            {
              token: getTokenAddress(withdrawVia.token),
              index: this.typeToRemoveLiquidityTokenIndex(withdrawVia.type),
            },
          ]
        : [],
    };
  }

  protected async fetchZapSplit(
    quoteStep: ZapQuoteStepSplit,
    inputs: TokenAmount[],
    via: CurveTokenOption,
    zapHelpers: ZapHelpers,
    insertBalance: boolean = false
  ): Promise<ZapStepResponse> {
    const { zap } = this.helpers;
    const { slippage, poolAddress, state } = zapHelpers;
    const input = first(inputs);
    const output = await this.quoteRemoveLiquidity(poolAddress, input.amount, via);
    const minOutputAmount = slipBy(output.amount, slippage, output.token.decimals);

    return {
      inputs,
      outputs: [output],
      minOutputs: [{ token: output.token, amount: minOutputAmount }],
      returned: [],
      zaps: [
        this.buildZapRemoveLiquidityTx(
          poolAddress,
          via,
          toWei(input.amount, input.token.decimals),
          toWei(minOutputAmount, output.token.decimals),
          zap.router,
          insertBalance
        ),
      ],
    };
  }

  public async fetchWithdrawStep(
    quote: CurveWithdrawQuote,
    t: TFunction<Namespace<string>, undefined>
  ): Promise<Step> {
    const { vault, vaultType } = this.helpers;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, vault.chainId);
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

      // Step 1. Withdraw from vault
      const vaultWithdraw = await vaultType.fetchZapWithdraw({
        inputs: quote.inputs,
      });
      if (vaultWithdraw.outputs.length !== 1) {
        throw new Error('Withdraw output count mismatch');
      }

      const withdrawOutput = first(vaultWithdraw.outputs);
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
        zapHelpers
      );
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
          swapQuotes.map((quoteStep, i) =>
            this.fetchZapSwap(quoteStep, zapHelpers, insertBalance || lastSwapIndex === i)
          )
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
    const { vault, swapAggregator, getState } = this.helpers;
    const state = getState();
    return await swapAggregator.fetchTokenSupport(
      this.possibleTokens.map(option => option.token),
      vault.id,
      vault.chainId,
      state,
      this.options.swap
    );
  }
}
