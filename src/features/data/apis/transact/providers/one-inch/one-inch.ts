import { BeefyState } from '../../../../../../redux-types';
import { isStandardVault, VaultEntity, VaultStandard } from '../../../../entities/vault';
import {
  InputTokenAmount,
  isZapQuoteStepSwap,
  ITransactProvider,
  TokenAmount,
  TransactOption,
  TransactQuote,
  ZapOption,
  ZapQuote,
  ZapQuoteStepSwap,
} from '../../transact-types';
import { Namespace, TFunction } from 'react-i18next';
import { Step } from '../../../../reducers/wallet/stepper';
import { selectStandardVaultById, selectVaultById } from '../../../../selectors/vaults';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectErc20TokenByAddress,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
  selectTokenPriceByTokenOracleId,
} from '../../../../selectors/tokens';
import { isTokenEqual, isTokenErc20, TokenEntity, TokenErc20 } from '../../../../entities/token';
import { selectOneInchZapByChainId } from '../../../../selectors/zap';
import { ZapEntityOneInch } from '../../../../entities/zap';
import { AmmEntity } from '../../../../entities/amm';
import { createOptionId, createQuoteId, createTokensId } from '../../utils';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import { first, uniqBy } from 'lodash';
import {
  BIG_ONE,
  BIG_ZERO,
  fromWei,
  fromWeiString,
  isFiniteBigNumber,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number';
import { getOneInchApi } from '../../../instances';
import { selectChainById } from '../../../../selectors/chains';
import { walletActions } from '../../../../actions/wallet-actions';
import {
  nativeToWNative,
  tokensToLp,
  tokensToZapIn,
  tokensToZapWithdraw,
  wnativeToNative,
} from '../../helpers/tokens';
import { selectTransactSlippage } from '../../../../selectors/transact';
import BigNumber from 'bignumber.js';
import { computeSolidlyPairAddress } from '../../helpers/solidly';
import { computeUniswapV2PairAddress } from '../../helpers/uniswapv2';
import { OneInchApi } from '../../../one-inch';
import { getPool } from '../../../amm';
import { IPool, WANT_TYPE } from '../../../amm/types';
import { getVaultWithdrawnFromState } from '../../helpers/vault';

export type OneInchZapOptionBase = {
  zap: ZapEntityOneInch;
} & ZapOption;

export type OneInchZapOptionLP = OneInchZapOptionBase & {
  subtype: 'lp';
  amm: AmmEntity;
  lpTokens: TokenErc20[];
};

export type OneInchZapOptionSingle = OneInchZapOptionBase & {
  subtype: 'single';
};

export type OneInchZapOption = OneInchZapOptionLP | OneInchZapOptionSingle;

export type OneInchZapQuote = ZapQuote & {
  wantType: WANT_TYPE;
};

export class OneInchZapProvider implements ITransactProvider {
  public static readonly ID = 'one-inch';
  private depositCache: Record<string, OneInchZapOption[]> = {};
  private withdrawCache: Record<string, OneInchZapOption[]> = {};

  getId(): string {
    return OneInchZapProvider.ID;
  }

  async isSingleAssetVault(vault: VaultStandard, state: BeefyState): Promise<boolean> {
    // assume all vaults with 1 asset are 'single asset'; later we have a token block list to filter out false positives
    return vault.assetIds.length === 1;
  }

  async isLPVault(vault: VaultStandard, state: BeefyState): Promise<boolean> {
    return vault.assetIds.length > 1;
  }

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<OneInchZapOption[] | null> {
    const vault = selectVaultById(state, vaultId);

    if (!isStandardVault(vault)) {
      return null;
    }

    if (await this.isSingleAssetVault(vault, state)) {
      return this.getSingleDepositOptionsFor(vault, state);
    } else if (await this.isLPVault(vault, state)) {
      return this.getLPDepositOptionsFor(vault, state);
    }

    return null;
  }

  async getSingleDepositOptionsFor(
    vault: VaultEntity,
    state: BeefyState
  ): Promise<OneInchZapOptionSingle[] | null> {
    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        console.warn(this.getId(), `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      return null;
    }

    const blockedVault = zap.blockedVaults.find(id => vault.id === id);
    if (blockedVault !== undefined) {
      return null;
    }

    const blockedToken = zap.blockedTokens.find(id => depositToken.id === id);
    if (blockedToken !== undefined) {
      return null;
    }

    const zapTokens = zap.depositFromTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => this.isDifferentTokenWithPrice(token, depositToken, state));

    if (!zapTokens || zapTokens.length === 0) {
      return null;
    }

    const options: OneInchZapOptionSingle[] = zapTokens.map(token => {
      const tokenAddresses = [token].map(token => token.address.toLowerCase());

      return {
        id: createOptionId(this.getId(), vault.id, vault.chainId, tokenAddresses),
        type: 'zap',
        subtype: 'single',
        mode: TransactMode.Deposit,
        providerId: this.getId(),
        vaultId: vault.id,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses: tokenAddresses,
        fee: zap.fee,
        zap,
      };
    });

    this.depositCache[vault.id] = options;

    return options;
  }

  getAmm(
    amms: AmmEntity[],
    depositTokenAddress: TokenEntity['address'],
    lpTokens: TokenEntity[]
  ): AmmEntity | null {
    const amm = amms.find(
      amm =>
        (amm.type === 'uniswapv2' &&
          depositTokenAddress ===
            computeUniswapV2PairAddress(
              amm.factoryAddress,
              amm.pairInitHash,
              lpTokens[0].address,
              lpTokens[1].address
            )) ||
        (amm.type === 'solidly' &&
          (depositTokenAddress ===
            computeSolidlyPairAddress(
              amm.factoryAddress,
              amm.pairInitHash,
              lpTokens[0].address,
              lpTokens[1].address,
              true
            ) ||
            depositTokenAddress ===
              computeSolidlyPairAddress(
                amm.factoryAddress,
                amm.pairInitHash,
                lpTokens[0].address,
                lpTokens[1].address,
                false
              )))
    );

    return amm || null;
  }

  isDifferentTokenWithPrice(
    token: TokenEntity | undefined,
    depositToken: TokenEntity,
    state: BeefyState
  ): boolean {
    if (!token) {
      return false;
    }

    if (isTokenEqual(token, depositToken)) {
      return false;
    }

    const price = selectTokenPriceByTokenOracleId(state, token.oracleId);
    return isFiniteBigNumber(price) && !price.isZero() && !price.isNegative();
  }

  tokensHavePrices(tokens: TokenErc20[], state: BeefyState): boolean {
    return tokens.every(token => {
      const price = selectTokenPriceByTokenOracleId(state, token.oracleId);
      return isFiniteBigNumber(price) && !price.isZero() && !price.isNegative();
    });
  }

  async getLPDepositOptionsFor(
    vault: VaultEntity,
    state: BeefyState
  ): Promise<OneInchZapOptionLP[] | null> {
    if (vault.assetIds.length !== 2) {
      return null;
    }

    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        console.warn(this.getId(), `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      return null;
    }

    const blockedVault = zap.blockedVaults.find(id => vault.id === id);
    if (blockedVault !== undefined) {
      return null;
    }

    let amms = state.entities.amms.byChainId[vault.chainId];
    if (amms === undefined || amms.length === 0) {
      return null;
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    const lpTokens = tokensToLp(tokens, wnative);
    if (!this.tokensHavePrices(lpTokens, state)) {
      return null;
    }

    const lpTokenIds = lpTokens.map(token => token.id);
    const blockedToken = zap.blockedTokens.find(id => lpTokenIds.includes(id));
    if (blockedToken !== undefined) {
      return null;
    }

    const amm = this.getAmm(amms, depositToken.address, lpTokens);
    if (!amm) {
      return null;
    }

    const native = selectChainNativeToken(state, vault.chainId);
    const lpZapTokens = tokensToZapIn(tokens, wnative, native);
    const oneInchZapTokens = zap.depositFromTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => this.isDifferentTokenWithPrice(token, depositToken, state));
    const zapTokens = uniqBy(lpZapTokens.concat(oneInchZapTokens), token => token.id);

    if (!zapTokens || zapTokens.length === 0) {
      return null;
    }

    const options: OneInchZapOptionLP[] = zapTokens.map(token => {
      const tokenAddresses = [token].map(token => token.address.toLowerCase());

      return {
        id: createOptionId(this.getId(), vault.id, vault.chainId, tokenAddresses),
        type: 'zap',
        subtype: 'lp',
        mode: TransactMode.Deposit,
        providerId: this.getId(),
        vaultId: vault.id,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses: tokenAddresses,
        fee: zap.fee,
        zap,
        lpTokens,
        amm,
      };
    });

    this.depositCache[vault.id] = options;

    return options;
  }

  async getDepositQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<OneInchZapQuote | null> {
    if (isSingleOption(option)) {
      return this.getSingleDepositQuoteFor(option, amounts, state);
    } else if (isLPOption(option)) {
      return this.getLPDepositQuoteFor(option, amounts, state);
    } else {
      console.error(option);
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }
  }

  async getSingleDepositQuoteFor(
    option: OneInchZapOptionSingle,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<OneInchZapQuote | null> {
    const userInput = first(amounts);
    if (!userInput || userInput.amount.lte(BIG_ZERO)) {
      throw new Error(`Quote called with 0 input`);
    }

    const vault = selectStandardVaultById(state, option.vaultId);
    const chain = selectChainById(state, option.chainId);
    const wnative = selectChainWrappedNativeToken(state, chain.id);
    const api = await getOneInchApi(chain);
    const userTokenIn = userInput.token;
    const swapTokenIn = nativeToWNative(userTokenIn, wnative);
    const swapTokenInAddress = swapTokenIn.address;
    const swapAmountIn = userInput.amount;
    const swapAmountInWei = toWeiString(swapAmountIn, swapTokenIn.decimals);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const swapTokenOut = nativeToWNative(depositToken, wnative);
    const swapTokenOutAddress = swapTokenOut.address;
    const apiQuote = await api.getQuote({
      amount: swapAmountInWei,
      fromTokenAddress: swapTokenInAddress,
      toTokenAddress: swapTokenOutAddress,
    });

    if (!apiQuote) {
      throw new Error(
        `Failed to fetch quote for ${swapTokenIn.symbol}->${swapTokenOut.symbol} from 1inch`
      );
    }

    if (apiQuote.fromTokenAmount !== swapAmountInWei) {
      throw new Error(`Quote does not cover full amount requested`);
    }

    if (
      apiQuote.fromToken.address.toLowerCase() !== swapTokenInAddress.toLowerCase() ||
      apiQuote.fromToken.decimals !== swapTokenIn.decimals ||
      apiQuote.toToken.address.toLowerCase() !== swapTokenOutAddress.toLowerCase() ||
      apiQuote.toToken.decimals !== swapTokenOut.decimals
    ) {
      throw new Error(`Token mismatch`);
    }

    const swapAmountOut = fromWeiString(apiQuote.toTokenAmount, swapTokenOut.decimals);
    if (swapAmountOut.lte(BIG_ZERO)) {
      throw new Error(`Quote returned zero ${swapTokenOut.symbol}`);
    }
    const priceImpact = await this.getPriceImpact(
      api,
      state,
      wnative,
      swapAmountIn,
      swapTokenIn,
      swapAmountOut,
      swapTokenOut
    );

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      wantType: WANT_TYPE.SINGLE,
      allowances: amounts
        .filter(tokenAmount => isTokenErc20(tokenAmount.token))
        .map(tokenAmount => ({
          token: tokenAmount.token as TokenErc20,
          amount: tokenAmount.amount,
          spenderAddress: option.zap.zapAddress,
        })),
      inputs: amounts,
      outputs: [
        {
          token: depositToken,
          amount: swapAmountOut,
        },
      ],
      priceImpact,
      steps: [
        {
          type: 'swap',
          fromToken: swapTokenIn,
          fromAmount: swapAmountIn,
          toToken: swapTokenOut,
          toAmount: swapAmountOut,
          priceImpact,
        },
        {
          type: 'deposit',
          token: depositToken,
          amount: swapAmountOut,
        },
      ],
    };
  }

  async getLPDepositQuoteFor(
    option: OneInchZapOptionLP,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<OneInchZapQuote | null> {
    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const userInput = first(amounts);
    if (userInput.amount.lte(BIG_ZERO)) {
      throw new Error(`Quote called with 0 input`);
    }

    const vault = selectStandardVaultById(state, option.vaultId);
    const chain = selectChainById(state, option.chainId);
    const wnative = selectChainWrappedNativeToken(state, chain.id);
    const depositToken = selectErc20TokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const userTokenIn = userInput.token;
    const userAmountIn = userInput.amount;
    const swapTokenIn = nativeToWNative(userTokenIn, wnative);
    const lp = getPool(depositToken.address, option.amm, chain);
    const [api] = await Promise.all([getOneInchApi(chain), lp.updateAllData()]);
    const swapAmountsInWei = await this.getSwapAmountsIn(
      lp,
      toWei(userAmountIn, userTokenIn.decimals)
    );
    const swapTokensOut = option.lpTokens;
    const swapAmountsOutWei = await Promise.all(
      swapAmountsInWei.map((amountIn, i) =>
        this.getQuoteIfNeeded(api, amountIn, swapTokenIn, swapTokensOut[i])
      )
    );
    const swaps: ZapQuoteStepSwap[] = (
      await Promise.all(
        swapAmountsOutWei.map(async (amountOutWei, i) => {
          // null amount out means no swap needed (input token is one of the lp tokens)
          if (amountOutWei) {
            return {
              type: 'swap' as const,
              fromToken: swapTokenIn,
              fromAmount: fromWei(swapAmountsInWei[i], swapTokenIn.decimals),
              toToken: swapTokensOut[i],
              toAmount: fromWei(amountOutWei, swapTokensOut[i].decimals),
              priceImpact: await this.getPriceImpact(
                api,
                state,
                wnative,
                fromWei(swapAmountsInWei[i], swapTokenIn.decimals),
                swapTokenIn,
                fromWei(amountOutWei, swapTokensOut[i].decimals),
                swapTokensOut[i]
              ),
            };
          }

          return null;
        })
      )
    ).filter(swap => !!swap);
    const maxPriceImpact = Math.max(...swaps.map(swap => swap.priceImpact));

    const tokenAmountsToAdd = swapAmountsOutWei.map((amountOutWei, i) => {
      if (amountOutWei) {
        return {
          token: swapTokensOut[i],
          amount: fromWei(amountOutWei, swapTokensOut[i].decimals),
        };
      }

      return {
        token: swapTokenIn,
        amount: fromWei(swapAmountsInWei[i], swapTokenIn.decimals),
      };
    });

    const liquidity = this.addLiquidity(lp, tokenAmountsToAdd, depositToken);

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      wantType: lp.getWantType(),
      allowances: amounts
        .filter(tokenAmount => isTokenErc20(tokenAmount.token))
        .map(tokenAmount => ({
          token: tokenAmount.token as TokenErc20,
          amount: tokenAmount.amount,
          spenderAddress: option.zap.zapAddress,
        })),
      inputs: amounts,
      outputs: [
        {
          token: depositToken,
          amount: liquidity,
        },
      ],
      priceImpact: maxPriceImpact,
      steps: [
        ...swaps,
        {
          type: 'build',
          inputs: tokenAmountsToAdd,
          outputToken: depositToken,
          outputAmount: liquidity,
        },
        {
          type: 'deposit',
          token: depositToken,
          amount: liquidity,
        },
      ],
    };
  }

  addLiquidity(lp: IPool, tokenAmounts: TokenAmount[], depositToken: TokenEntity): BigNumber {
    const amountA = toWei(tokenAmounts[0].amount, tokenAmounts[0].token.decimals);
    const tokenA = tokenAmounts[0].token.address;
    const amountB = toWei(tokenAmounts[1].amount, tokenAmounts[1].token.decimals);

    const { liquidity } = lp.addLiquidity(amountA, tokenA, amountB);

    return fromWei(liquidity, depositToken.decimals);
  }

  async getPriceImpact(
    api: OneInchApi,
    state: BeefyState,
    wnative: TokenErc20,
    amountIn: BigNumber,
    tokenIn: TokenEntity,
    amountOut: BigNumber,
    tokenOut: TokenEntity
  ): Promise<number> {
    return this.getPriceImpactFromPriceApi(
      api,
      state,
      wnative,
      amountIn,
      tokenIn,
      amountOut,
      tokenOut
    );
  }

  async getPriceImpactFromPriceApi(
    api: OneInchApi,
    state: BeefyState,
    wnative: TokenErc20,
    amountIn: BigNumber,
    tokenIn: TokenEntity,
    amountOut: BigNumber,
    tokenOut: TokenEntity
  ): Promise<number> {
    const swaps: TokenAmount[] = [
      { amount: amountIn, token: nativeToWNative(tokenIn, wnative) },
      { amount: amountOut, token: nativeToWNative(tokenOut, wnative) },
    ];

    const [beefyNativePriceInUsd, ...beefyPricesInUsd] = [
      wnative,
      ...swaps.map(swap => swap.token),
    ].map(token => {
      const beefyPrice = selectTokenPriceByTokenOracleId(state, token.oracleId);
      if (!isFiniteBigNumber(beefyPrice) || beefyPrice.isZero() || beefyPrice.isNegative()) {
        throw new Error(`No price for ${token.symbol} via Beefy price oracle "${token.oracleId}".`);
      }
      return beefyPrice;
    });

    const prices = await api.getPriceInNative({
      tokenAddresses: swaps.map(swap => swap.token.address),
    });

    const oneInchPricesInNative = swaps.map(swap => {
      const price = fromWei(prices[swap.token.address], wnative.decimals)
        .shiftedBy(swap.token.decimals)
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .shiftedBy(-wnative.decimals);

      if (price.lte(BIG_ZERO)) {
        throw new Error(`No price for ${swap.token.symbol} via 1inch off chain oracle`);
      }

      return price;
    });

    const oneInchPricesInUsd = oneInchPricesInNative.map(price =>
      price.multipliedBy(beefyNativePriceInUsd)
    );

    beefyPricesInUsd.forEach((beefyPrice, i) => {
      const isClose = oneInchPricesInUsd[i]
        .minus(beefyPrice)
        .dividedBy(beefyPrice)
        .absoluteValue()
        .isLessThan(0.1);
      if (!isClose) {
        throw new Error(
          `Price for ${swaps[i].token.symbol} via 1inch off chain oracle is not close enough to Beefy price API`
        );
      }
    });

    console.debug(
      'beefyPricesInUsd',
      beefyPricesInUsd.map(p => p.toString(10))
    );
    console.debug(
      'oneInchPricesInNative',
      oneInchPricesInNative.map(p => p.toString(10))
    );
    console.debug(
      'oneInchPricesInUsd',
      oneInchPricesInUsd.map(p => p.toString(10))
    );

    const [inputValue, outputValue] = oneInchPricesInNative.map((price, i) =>
      price.multipliedBy(swaps[i].amount)
    );

    console.debug('inputValue', inputValue.toString(10));
    console.debug('outputValue', outputValue.toString(10));

    return BIG_ONE.minus(BigNumber.min(outputValue.dividedBy(inputValue), BIG_ONE)).toNumber();
  }

  async getQuoteIfNeeded(
    api: OneInchApi,
    amountInWei: BigNumber,
    tokenIn: TokenErc20,
    tokenOut: TokenErc20
  ): Promise<BigNumber | null> {
    if (!isTokenEqual(tokenIn, tokenOut)) {
      const swapAmountInWei = amountInWei.toString(10);
      const apiQuote = await api.getQuote({
        amount: swapAmountInWei,
        fromTokenAddress: tokenIn.address,
        toTokenAddress: tokenOut.address,
      });

      if (!apiQuote) {
        throw new Error(
          `Failed to fetch quote for ${tokenIn.symbol}->${tokenOut.symbol} from 1inch`
        );
      }

      if (apiQuote.fromTokenAmount !== swapAmountInWei) {
        throw new Error(`Quote does not cover full amount requested`);
      }

      if (
        apiQuote.fromToken.address.toLowerCase() !== tokenIn.address.toLowerCase() ||
        apiQuote.fromToken.decimals !== tokenIn.decimals ||
        apiQuote.toToken.address.toLowerCase() !== tokenOut.address.toLowerCase() ||
        apiQuote.toToken.decimals !== tokenOut.decimals
      ) {
        throw new Error(`Token mismatch`);
      }

      const swapAmountOutWei = new BigNumber(apiQuote.toTokenAmount);
      if (swapAmountOutWei.lte(BIG_ZERO)) {
        throw new Error(`Quote returned zero ${tokenOut.symbol}`);
      }

      return swapAmountOutWei;
    }

    return null;
  }

  async getSwapAmountsIn(lp: IPool, inputAmountWei: BigNumber): Promise<[BigNumber, BigNumber]> {
    const { amount0, amount1 } = lp.getAddLiquidityRatio(inputAmountWei);

    const min = new BigNumber(1000);

    if (amount0.lt(min) || amount1.lt(min)) {
      throw new Error('Swap amount too small');
    }

    return [amount0, amount1];
  }

  async getDepositStep(
    quote: OneInchZapQuote,
    option: ZapOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (isSingleOption(option)) {
      return this.getSingleDepositStep(quote, option, state, t);
    } else if (isLPOption(option)) {
      return this.getLPDepositStep(quote, option, state, t);
    } else {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }
  }

  async getSingleDepositStep(
    quote: OneInchZapQuote,
    option: OneInchZapOptionSingle,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectVaultById(state, option.vaultId);
    const slippage = selectTransactSlippage(state);
    const inputToken = first(quote.inputs).token;
    const swap = quote.steps.find(step => isZapQuoteStepSwap(step));
    if (!swap || !isZapQuoteStepSwap(swap)) {
      throw new Error(`No swap step in zap quote`);
    }

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.oneInchBeefInSingle(vault, inputToken, swap, option.zap, slippage),
      pending: false,
      extraInfo: { zap: true },
    };
  }

  async getLPDepositStep(
    quote: OneInchZapQuote,
    option: OneInchZapOptionLP,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectVaultById(state, option.vaultId);
    const slippage = selectTransactSlippage(state);
    const input = first(quote.inputs);
    const swaps: ZapQuoteStepSwap[] = quote.steps.filter(isZapQuoteStepSwap);
    if (!swaps || !swaps.length) {
      throw new Error(`No swap steps in zap quote`);
    }

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.oneInchBeefInLP(
        vault,
        input,
        swaps,
        option.zap,
        option.lpTokens,
        quote.wantType,
        slippage
      ),
      pending: false,
      extraInfo: { zap: true },
    };
  }

  async getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    const vault = selectVaultById(state, vaultId);

    if (!isStandardVault(vault)) {
      return null;
    }

    if (vaultId in this.withdrawCache) {
      return this.withdrawCache[vaultId];
    }

    if (await this.isSingleAssetVault(vault, state)) {
      return this.getSingleWithdrawOptionsFor(vault, state);
    } else if (await this.isLPVault(vault, state)) {
      return this.getLPWithdrawOptionsFor(vault, state);
    }

    return null;
  }

  async getSingleWithdrawOptionsFor(
    vault: VaultEntity,
    state: BeefyState
  ): Promise<OneInchZapOptionSingle[] | null> {
    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        console.warn(this.getId(), `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      return null;
    }

    const blockedVault = zap.blockedVaults.find(id => vault.id === id);
    if (blockedVault !== undefined) {
      return null;
    }

    const blockedToken = zap.blockedTokens.find(id => depositToken.id === id);
    if (blockedToken !== undefined) {
      return null;
    }

    const zapTokens = zap.withdrawToTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => this.isDifferentTokenWithPrice(token, depositToken, state));

    if (!zapTokens || zapTokens.length === 0) {
      return null;
    }

    const options: OneInchZapOptionSingle[] = zapTokens.map(token => {
      const tokenAddresses = [token].map(token => token.address.toLowerCase());

      return {
        id: createOptionId(this.getId(), vault.id, vault.chainId, tokenAddresses),
        type: 'zap',
        subtype: 'single',
        mode: TransactMode.Withdraw,
        providerId: this.getId(),
        vaultId: vault.id,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses: tokenAddresses,
        fee: zap.fee,
        zap,
      };
    });

    this.withdrawCache[vault.id] = options;

    return options;
  }

  async getLPWithdrawOptionsFor(
    vault: VaultEntity,
    state: BeefyState
  ): Promise<OneInchZapOptionLP[] | null> {
    if (vault.assetIds.length !== 2) {
      return null;
    }

    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        console.warn(this.getId(), `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      return null;
    }

    const blockedVault = zap.blockedVaults.find(id => vault.id === id);
    if (blockedVault !== undefined) {
      return null;
    }

    let amms = state.entities.amms.byChainId[vault.chainId];
    if (amms === undefined || amms.length === 0) {
      return null;
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    const lpTokens = tokensToLp(tokens, wnative);
    if (!this.tokensHavePrices(lpTokens, state)) {
      return null;
    }

    const lpTokenIds = lpTokens.map(token => token.id);
    const blockedToken = zap.blockedTokens.find(id => lpTokenIds.includes(id));
    if (blockedToken !== undefined) {
      return null;
    }

    const amm = this.getAmm(amms, depositToken.address, lpTokens);
    if (!amm) {
      return null;
    }

    const native = selectChainNativeToken(state, vault.chainId);
    const lpWithdrawTokens = tokensToZapWithdraw(lpTokens, wnative, native);
    const oneInchZapTokens = zap.withdrawToTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => this.isDifferentTokenWithPrice(token, depositToken, state));
    const zapTokens = uniqBy(lpWithdrawTokens.concat(oneInchZapTokens), token => token.id);

    if (!zapTokens || zapTokens.length === 0) {
      return null;
    }

    const options: OneInchZapOptionLP[] = zapTokens.map(token => {
      const tokenAddresses = [token].map(token => token.address.toLowerCase());

      return {
        id: createOptionId(this.getId(), vault.id, vault.chainId, tokenAddresses),
        type: 'zap',
        subtype: 'lp',
        mode: TransactMode.Withdraw,
        providerId: this.getId(),
        vaultId: vault.id,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses: tokenAddresses,
        fee: zap.fee,
        zap,
        lpTokens,
        amm,
      };
    });

    this.withdrawCache[vault.id] = options;

    return options;
  }

  async getWithdrawQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<TransactQuote | null> {
    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const userInput = first(amounts);
    if (!userInput || userInput.amount.lte(BIG_ZERO)) {
      throw new Error(`Quote called with 0 input`);
    }

    if (isSingleOption(option)) {
      return this.getSingleWithdrawQuoteFor(option, userInput, state);
    } else if (isLPOption(option)) {
      return this.getLPWithdrawQuoteFor(option, userInput, state);
    } else {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }
  }

  async getSingleWithdrawQuoteFor(
    option: OneInchZapOptionSingle,
    userInput: InputTokenAmount,
    state: BeefyState
  ): Promise<OneInchZapQuote | null> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const { shareToken, sharesToWithdrawWei, withdrawnToken, withdrawnAmountAfterFeeWei } =
      getVaultWithdrawnFromState(userInput, vault, state);

    if (!isTokenEqual(withdrawnToken, userInput.token)) {
      throw new Error(`Invalid input token ${userInput.token.symbol}`);
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const native = selectChainNativeToken(state, vault.chainId);

    const swapTokenIn = nativeToWNative(userInput.token, wnative);
    const swapTokenInAddress = swapTokenIn.address;
    const swapAmountIn = fromWei(withdrawnAmountAfterFeeWei, swapTokenIn.decimals);
    const swapAmountInWei = withdrawnAmountAfterFeeWei.toString(10);

    const wantedTokenOut = selectTokenByAddress(state, option.chainId, option.tokenAddresses[0]);
    const actualTokenOut = wnativeToNative(wantedTokenOut, wnative, native); // zap always converts wnative to native
    const swapTokenOut = nativeToWNative(wantedTokenOut, wnative); // swaps are always between erc20
    const swapTokenOutAddress = swapTokenOut.address;

    const chain = selectChainById(state, option.chainId);
    const api = await getOneInchApi(chain);
    const apiQuote = await api.getQuote({
      amount: swapAmountInWei,
      fromTokenAddress: swapTokenInAddress,
      toTokenAddress: swapTokenOutAddress,
    });

    if (!apiQuote) {
      throw new Error(
        `Failed to fetch quote for ${swapTokenIn.symbol}->${swapTokenOut.symbol} from 1inch`
      );
    }

    if (apiQuote.fromTokenAmount !== swapAmountInWei) {
      throw new Error(`Quote does not cover full amount requested`);
    }

    if (
      apiQuote.fromToken.address.toLowerCase() !== swapTokenInAddress.toLowerCase() ||
      apiQuote.fromToken.decimals !== swapTokenIn.decimals ||
      apiQuote.toToken.address.toLowerCase() !== swapTokenOutAddress.toLowerCase() ||
      apiQuote.toToken.decimals !== swapTokenOut.decimals
    ) {
      throw new Error(`Token mismatch`);
    }

    const swapAmountOut = fromWeiString(apiQuote.toTokenAmount, swapTokenOut.decimals);
    if (swapAmountOut.lte(BIG_ZERO)) {
      throw new Error(`Quote returned zero ${swapTokenOut.symbol}`);
    }

    const priceImpact = await this.getPriceImpact(
      api,
      state,
      wnative,
      swapAmountIn,
      swapTokenIn,
      swapAmountOut,
      swapTokenOut
    );

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      wantType: WANT_TYPE.SINGLE,
      allowances: [
        {
          token: shareToken,
          amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
          spenderAddress: option.zap.zapAddress,
        },
      ],
      inputs: [
        {
          token: withdrawnToken,
          amount: userInput.amount,
          max: userInput.max,
        },
      ],
      outputs: [
        {
          token: actualTokenOut,
          amount: swapAmountOut,
        },
      ],
      priceImpact,
      steps: [
        {
          type: 'swap',
          fromToken: swapTokenIn,
          fromAmount: swapAmountIn,
          toToken: swapTokenOut,
          toAmount: swapAmountOut,
          priceImpact,
        },
      ],
    };
  }

  async getLPWithdrawQuoteFor(
    option: OneInchZapOptionLP,
    userInput: InputTokenAmount,
    state: BeefyState
  ): Promise<OneInchZapQuote | null> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const { shareToken, sharesToWithdrawWei, withdrawnToken, withdrawnAmountAfterFeeWei } =
      getVaultWithdrawnFromState(userInput, vault, state);

    if (!isTokenEqual(withdrawnToken, userInput.token)) {
      throw new Error(`Invalid input token ${userInput.token.symbol}`);
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const native = selectChainNativeToken(state, vault.chainId);
    const chain = selectChainById(state, vault.chainId);
    const wantedTokenOut = selectTokenByAddress(state, option.chainId, option.tokenAddresses[0]);
    const actualTokenOut = wnativeToNative(wantedTokenOut, wnative, native); // zap always converts wnative to native
    const swapTokenOut = nativeToWNative(wantedTokenOut, wnative); // swaps are always between erc20
    const lp = getPool(withdrawnToken.address, option.amm, chain);
    const [api] = await Promise.all([getOneInchApi(chain), lp.updateAllData()]);
    const swapTokensIn = option.lpTokens;
    const swapAmountsInWei = OneInchZapProvider.quoteRemoveLiquidity(
      lp,
      withdrawnAmountAfterFeeWei
    );

    const swapAmountsOutWei = await Promise.all(
      swapAmountsInWei.map((amountInWei, i) =>
        this.getQuoteIfNeeded(api, amountInWei, swapTokensIn[i], swapTokenOut)
      )
    );
    let totalOutWei = BIG_ZERO;
    const swaps: ZapQuoteStepSwap[] = (
      await Promise.all(
        swapAmountsOutWei.map(async (amountOutWei, i) => {
          // null amount out means no swap needed (swap in token is one of the lp tokens)
          if (amountOutWei) {
            totalOutWei = totalOutWei.plus(amountOutWei);
            return {
              type: 'swap' as const,
              fromToken: swapTokensIn[i],
              fromAmount: fromWei(swapAmountsInWei[i], swapTokensIn[i].decimals),
              toToken: swapTokenOut,
              toAmount: fromWei(amountOutWei, swapTokenOut.decimals),
              priceImpact: await this.getPriceImpact(
                api,
                state,
                wnative,
                fromWei(swapAmountsInWei[i], swapTokensIn[i].decimals),
                swapTokensIn[i],
                fromWei(amountOutWei, swapTokenOut.decimals),
                swapTokenOut
              ),
            };
          }

          totalOutWei = totalOutWei.plus(swapAmountsInWei[i]);
          return null;
        })
      )
    ).filter(swap => !!swap);
    const maxPriceImpact = Math.max(...swaps.map(swap => swap.priceImpact));

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      wantType: lp.getWantType(),
      allowances: [
        {
          token: shareToken,
          amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
          spenderAddress: option.zap.zapAddress,
        },
      ],
      inputs: [userInput],
      outputs: [
        {
          token: actualTokenOut,
          amount: fromWei(totalOutWei, actualTokenOut.decimals),
        },
      ],
      priceImpact: maxPriceImpact,
      steps: [
        {
          type: 'split',
          inputToken: withdrawnToken,
          inputAmount: fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals),
          outputs: [
            {
              token: swapTokensIn[0],
              amount: fromWei(swapAmountsInWei[0], swapTokensIn[0].decimals),
            },
            {
              token: swapTokensIn[1],
              amount: fromWei(swapAmountsInWei[1], swapTokensIn[1].decimals),
            },
          ],
        },
        ...swaps,
      ],
    };
  }

  static quoteRemoveLiquidity(
    lp: IPool,
    withdrawnTokenAmountAfterFeeWei: BigNumber
  ): [BigNumber, BigNumber] {
    const { amount0, amount1 } = lp.removeLiquidity(withdrawnTokenAmountAfterFeeWei);

    return [amount0, amount1];
  }

  async getWithdrawStep(
    quote: OneInchZapQuote,
    option: ZapOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (isSingleOption(option)) {
      return this.getSingleWithdrawStep(quote, option, state, t);
    } else if (isLPOption(option)) {
      return this.getLPWithdrawStep(quote, option, state, t);
    } else {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }
  }

  async getSingleWithdrawStep(
    quote: OneInchZapQuote,
    option: OneInchZapOptionSingle,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const slippage = selectTransactSlippage(state);
    const input = first(quote.inputs);
    const swap = quote.steps.find(step => isZapQuoteStepSwap(step));
    if (!swap || !isZapQuoteStepSwap(swap)) {
      throw new Error(`No swap step in zap quote`);
    }

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.oneInchBeefOutSingle(vault, input, swap, option.zap, slippage),
      pending: false,
      extraInfo: { zap: true },
    };
  }

  async getLPWithdrawStep(
    quote: OneInchZapQuote,
    option: OneInchZapOptionLP,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const slippage = selectTransactSlippage(state);
    const input = first(quote.inputs);
    const swaps = quote.steps.filter(isZapQuoteStepSwap);
    if (!swaps || !swaps.length) {
      throw new Error(`No swap steps in zap quote`);
    }

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.oneInchBeefOutLP(
        vault,
        input,
        swaps,
        option.zap,
        option.lpTokens,
        option.amm,
        slippage
      ),
      pending: false,
      extraInfo: { zap: true },
    };
  }
}

function isOneInchOption(option: TransactOption): option is OneInchZapOption {
  return option.type === 'zap' && option.providerId === OneInchZapProvider.ID;
}

function isSingleOption(option: TransactOption): option is OneInchZapOptionSingle {
  return isOneInchOption(option) && option.subtype === 'single';
}

function isLPOption(option: TransactOption): option is OneInchZapOptionLP {
  return isOneInchOption(option) && option.subtype === 'lp';
}
