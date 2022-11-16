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
import {
  selectStandardVaultById,
  selectVaultById,
  selectVaultPricePerFullShare,
} from '../../../../selectors/vaults';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectErc20TokenByAddress,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
} from '../../../../selectors/tokens';
import { isTokenEqual, isTokenErc20, TokenEntity, TokenErc20 } from '../../../../entities/token';
import { selectOneInchZapByChainId } from '../../../../selectors/zap';
import { ZapEntityOneInch } from '../../../../entities/zap';
import { AmmEntity, isSolidlyAmm, isUniswapV2Amm } from '../../../../entities/amm';
import { createOptionId, createQuoteId, createTokensId } from '../../utils';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import { first, uniqBy } from 'lodash';
import {
  BIG_ONE,
  BIG_ZERO,
  fromWei,
  fromWeiString,
  toWei,
  toWeiString,
} from '../../../../../../helpers/big-number';
import { getOneInchApi, getWeb3Instance } from '../../../instances';
import { selectChainById } from '../../../../selectors/chains';
import { walletActions } from '../../../../actions/wallet-actions';
import {
  nativeToWNative,
  tokensToZapWithdraw,
  tokensToLp,
  tokensToZapIn,
  wnativeToNative,
} from '../../helpers/tokens';
import { selectTokenAmountValue } from '../../../../selectors/transact';
import BigNumber from 'bignumber.js';
import {
  computeSolidlyPairAddress,
  isStablePair,
  MetadataRaw,
  metadataToObject,
} from '../../helpers/solidly';
import {
  computeUniswapV2PairAddress,
  getOptimalAddLiquidityAmounts,
  LiquidityAmounts,
  quoteMint,
} from '../../helpers/uniswapv2';
import Web3 from 'web3';
import {
  BeefyZapOneInchAbi,
  SolidlyPairAbi,
  UniswapV2PairAbi,
  VaultAbi,
} from '../../../../../../config/abi';
import { OneInchApi } from '../../../one-inch';
import { MultiCall } from 'eth-multicall';
import { selectFeesByVaultId } from '../../../../selectors/fees';

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

type PoolMetadata = {
  reserves0: BigNumber;
  reserves1: BigNumber;
  totalSupply: BigNumber;
};

export class OneInchZapProvider implements ITransactProvider {
  private depositCache: Record<string, OneInchZapOption[]> = {};
  private withdrawCache: Record<string, OneInchZapOption[]> = {};

  getId(): string {
    return '1inch';
  }

  async isSingleAssetVault(vault: VaultStandard, state: BeefyState): Promise<boolean> {
    // TODO how do we know its not lp with one token e.g. stargate
    // pref without rpc call
    return vault.assetIds.length === 1;
  }

  async isLPVault(vault: VaultStandard, state: BeefyState): Promise<boolean> {
    return vault.assetIds.length > 1;
  }

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    const vault = selectVaultById(state, vaultId);

    if (!isStandardVault(vault)) {
      console.debug(this.getId(), `${vaultId} only standard vaults supported`);
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
    if (!isTokenErc20(depositToken)) {
      console.debug(this.getId(), `zap to non-erc20 not supported`);
      return null;
    }

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      console.debug(this.getId(), `no 1inch zap for ${vault.chainId}`);
      return null;
    }

    const blockedToken = zap.blockedDepositToTokens.find(id => depositToken.id === id);
    if (blockedToken !== undefined) {
      console.debug(
        this.getId(),
        `1inch zap for ${vault.chainId} blocks zapping to ${blockedToken}`
      );
      return null;
    }

    const zapTokens = zap.depositFromTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => !!token && !isTokenEqual(token, depositToken));

    if (!zapTokens || zapTokens.length === 0) {
      console.debug(this.getId(), `no zap tokens for 1inch ${zap.chainId} zap`);
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

  async getLPDepositOptionsFor(
    vault: VaultEntity,
    state: BeefyState
  ): Promise<OneInchZapOptionLP[] | null> {
    if (vault.assetIds.length !== 2) {
      console.debug(this.getId(), `only supports 2 asset lp vaults`);
      return null;
    }

    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        console.warn(this.getId(), `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      console.debug(this.getId(), `zap to non-erc20 not supported`);
      return null;
    }

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      console.debug(this.getId(), `no 1inch zap for ${vault.chainId}`);
      return null;
    }

    let amms = state.entities.amms.byChainId[vault.chainId];
    if (amms === undefined || amms.length === 0) {
      console.debug(
        this.getId(),
        `no amms for ${vault.chainId}`,
        state.entities.amms.byChainId[vault.chainId]
      );
      return null;
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    const lpTokens = tokensToLp(tokens, wnative);
    const lpTokenIds = lpTokens.map(token => token.id);

    const blockedToken = zap.blockedDepositToTokens.find(id => lpTokenIds.includes(id));
    if (blockedToken !== undefined) {
      console.debug(
        this.getId(),
        `1inch zap for ${vault.chainId} blocks zapping to ${blockedToken}`
      );
      return null;
    }

    const amm = this.getAmm(amms, depositToken.address, lpTokens);
    if (!amm) {
      console.debug(this.getId(), `no amm has lp ${depositToken.address}`);
      return null;
    }

    const native = selectChainNativeToken(state, vault.chainId);
    const lpZapTokens = tokensToZapIn(tokens, wnative, native);
    const oneInchZapTokens = zap.depositFromTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => !!token && !isTokenEqual(token, depositToken));
    const zapTokens = uniqBy(lpZapTokens.concat(oneInchZapTokens), token => token.id);

    if (!zapTokens || zapTokens.length === 0) {
      console.debug(this.getId(), `no zap tokens for 1inch ${zap.chainId} zap`);
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
  ): Promise<TransactQuote | null> {
    if (isSingleOption(option)) {
      return this.getSingleDepositQuoteFor(option, amounts, state);
    } else if (isLPOption(option)) {
      return this.getLPDepositQuoteFor(option, amounts, state);
    } else {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }
  }

  async getSingleDepositQuoteFor(
    option: OneInchZapOptionSingle,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<TransactQuote | null> {
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

    console.warn(apiQuote);

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

    const inputValue = selectTokenAmountValue(state, {
      amount: swapAmountIn,
      token: swapTokenIn,
    });
    const outputValue = selectTokenAmountValue(state, {
      amount: swapAmountOut,
      token: swapTokenOut,
    });
    const priceImpact = BIG_ONE.minus(
      BigNumber.min(outputValue.dividedBy(inputValue), BIG_ONE)
    ).toNumber();

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
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
  ): Promise<TransactQuote | null> {
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
    const [web3, api] = await Promise.all([getWeb3Instance(chain), getOneInchApi(chain)]);
    const swapAmountsIn = await this.getSwapAmountsIn(
      swapTokenIn,
      userAmountIn,
      depositToken,
      option,
      vault,
      web3
    );
    console.debug(
      this.getId(),
      swapAmountsIn.map(x => (x ? x.toString(10) : JSON.stringify(x)))
    );
    const swapTokensOut = option.lpTokens;
    const swapAmountsOut = await Promise.all(
      swapAmountsIn.map((amountIn, i) =>
        this.getQuoteIfNeeded(api, amountIn, swapTokenIn, swapTokensOut[i])
      )
    );
    const swaps: ZapQuoteStepSwap[] = swapAmountsOut
      .map((amountOut, i) => {
        // null amount out means no swap needed (input token is one of the lp tokens)
        if (amountOut) {
          return {
            type: 'swap' as const,
            fromToken: swapTokenIn,
            fromAmount: swapAmountsIn[i],
            toToken: swapTokensOut[i],
            toAmount: amountOut,
            priceImpact: this.getPriceImpact(
              state,
              swapAmountsIn[i],
              swapTokenIn,
              amountOut,
              swapTokensOut[i]
            ),
          };
        }

        return null;
      })
      .filter(swap => !!swap);
    const maxPriceImpact = Math.max(...swaps.map(swap => swap.priceImpact));

    const tokenAmountsToAdd = swapAmountsOut.map((amountOut, i) => {
      if (amountOut) {
        return {
          token: swapTokensOut[i],
          amount: amountOut,
        };
      }

      return {
        token: swapTokenIn,
        amount: swapAmountsIn[i],
      };
    });

    const multicall = new MultiCall(web3, chain.multicallAddress);
    const liquidity = await this.getLiquidityEstimate(
      option,
      tokenAmountsToAdd,
      depositToken,
      web3,
      multicall
    );

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
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

  async getLiquidityEstimate(
    option: OneInchZapOptionLP,
    tokenAmounts: TokenAmount[],
    depositToken: TokenErc20,
    web3: Web3,
    multicall: MultiCall
  ): Promise<BigNumber> {
    const { reserves0, reserves1, totalSupply } = await this.getPoolMetadata(
      option.amm,
      depositToken,
      web3,
      multicall
    );
    const [amount0, amount1] = tokenAmounts.map(tokenAmount =>
      toWei(tokenAmount.amount, tokenAmount.token.decimals)
    );
    const { amount0: optimalAmount0, amount1: optimalAmount1 } = getOptimalAddLiquidityAmounts(
      amount0,
      amount1,
      reserves0,
      reserves1
    );
    const liquidity = quoteMint(optimalAmount0, optimalAmount1, reserves0, reserves1, totalSupply);

    return fromWei(liquidity, depositToken.decimals);
  }

  async getPoolMetadata(
    amm: AmmEntity,
    depositToken: TokenErc20,
    web3: Web3,
    multicall: MultiCall
  ): Promise<PoolMetadata> {
    if (isUniswapV2Amm(amm)) {
      return this.getPoolMetadataUniswapV2(depositToken, web3, multicall);
    } else if (isSolidlyAmm(amm)) {
      return this.getPoolMetadataSolidly(depositToken, web3, multicall);
    }
  }

  async getPoolMetadataUniswapV2(
    depositToken: TokenErc20,
    web3: Web3,
    multicall: MultiCall
  ): Promise<PoolMetadata> {
    type MulticallReturnType = [
      [
        {
          reserves: Record<number, string>;
          totalSupply: string;
        }
      ]
    ];

    const pairContract = new web3.eth.Contract(UniswapV2PairAbi, depositToken.address);
    const [[pair]]: MulticallReturnType = (await multicall.all([
      [
        {
          reserves: pairContract.methods.getReserves(),
          totalSupply: pairContract.methods.totalSupply(),
        },
      ],
    ])) as MulticallReturnType;

    const [reserves0, reserves1] = Object.values(pair.reserves)
      .slice(0, 2)
      .map(amount => new BigNumber(amount));
    const totalSupply = new BigNumber(pair.totalSupply);

    return {
      reserves0,
      reserves1,
      totalSupply,
    };
  }

  async getPoolMetadataSolidly(
    depositToken: TokenErc20,
    web3: Web3,
    multicall: MultiCall
  ): Promise<PoolMetadata> {
    type MulticallReturnType = [
      [
        {
          metadata: MetadataRaw;
          totalSupply: string;
        }
      ]
    ];

    const pairContract = new web3.eth.Contract(SolidlyPairAbi, depositToken.address);
    const [[pair]]: MulticallReturnType = (await multicall.all([
      [
        {
          metadata: pairContract.methods.metadata(),
          totalSupply: pairContract.methods.totalSupply(),
        },
      ],
    ])) as MulticallReturnType;

    const metadata = metadataToObject(pair.metadata);
    const totalSupply = new BigNumber(pair.totalSupply);

    return {
      reserves0: metadata.reserves0,
      reserves1: metadata.reserves1,
      totalSupply,
    };
  }

  getPriceImpact(
    state: BeefyState,
    amountIn: BigNumber,
    tokenIn: TokenEntity,
    amountOut: BigNumber,
    tokenOut: TokenEntity
  ): number {
    const inputValue = selectTokenAmountValue(state, {
      amount: amountIn,
      token: tokenIn,
    });
    const outputValue = selectTokenAmountValue(state, {
      amount: amountOut,
      token: tokenOut,
    });

    return BIG_ONE.minus(BigNumber.min(outputValue.dividedBy(inputValue), BIG_ONE)).toNumber();
  }

  async getQuoteIfNeeded(
    api: OneInchApi,
    amountIn: BigNumber,
    tokenIn: TokenErc20,
    tokenOut: TokenErc20
  ): Promise<BigNumber | null> {
    if (!isTokenEqual(tokenIn, tokenOut)) {
      const swapAmountInWei = toWeiString(amountIn, tokenIn.decimals);
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

      const swapAmountOut = fromWeiString(apiQuote.toTokenAmount, tokenOut.decimals);
      if (swapAmountOut.lte(BIG_ZERO)) {
        throw new Error(`Quote returned zero ${tokenOut.symbol}`);
      }

      return swapAmountOut;
    }

    return null;
  }

  async getSwapAmountsIn(
    inputToken: TokenErc20,
    inputAmount: BigNumber,
    depositToken: TokenErc20,
    option: OneInchZapOptionLP,
    vault: VaultStandard,
    web3: Web3
  ): Promise<[BigNumber, BigNumber]> {
    if (isUniswapV2Amm(option.amm)) {
      return this.getSwapAmountsInUniswapV2(inputToken, inputAmount);
    } else if (isSolidlyAmm(option.amm)) {
      return this.getSwapAmountsInSolidly(
        inputToken,
        inputAmount,
        depositToken,
        option,
        vault,
        web3
      );
    }
  }

  async getSwapAmountsInUniswapV2(
    inputToken: TokenErc20,
    inputAmount: BigNumber
  ): Promise<[BigNumber, BigNumber]> {
    const amount0 = inputAmount.dividedBy(2).decimalPlaces(inputToken.decimals);
    const amount1 = inputAmount.minus(amount0);

    return [amount0, amount1];
  }

  async getSwapAmountsInSolidly(
    inputToken: TokenErc20,
    inputAmount: BigNumber,
    depositToken: TokenErc20,
    option: OneInchZapOptionLP,
    vault: VaultStandard,
    web3: Web3
  ): Promise<[BigNumber, BigNumber]> {
    const isStable = isStablePair(
      option.amm.factoryAddress,
      option.amm.pairInitHash,
      option.lpTokens[0].address,
      option.lpTokens[1].address,
      depositToken.address
    );

    let amount0 = inputAmount.dividedToIntegerBy(2);
    if (isStable) {
      const zapContract = new web3.eth.Contract(BeefyZapOneInchAbi, option.zap.zapAddress);
      const ratioWei = await zapContract.methods
        .quoteStableAddLiquidityRatio(vault.earnContractAddress)
        .call();
      const ratio = fromWeiString(ratioWei, 18);
      amount0 = inputAmount.multipliedBy(BIG_ONE.minus(ratio)).decimalPlaces(inputToken.decimals);
    }

    const amount1 = inputAmount.minus(amount0);
    return [amount0, amount1];
  }

  async getDepositStep(
    quote: ZapQuote,
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
    quote: ZapQuote,
    option: OneInchZapOptionSingle,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectVaultById(state, option.vaultId);
    const inputToken = first(quote.inputs).token;
    const swap = quote.steps.find(step => isZapQuoteStepSwap(step));
    if (!swap || !isZapQuoteStepSwap(swap)) {
      throw new Error(`No swap step in zap quote`);
    }

    return {
      step: 'deposit',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.oneInchBeefInSingle(vault, inputToken, swap, option.zap, 0.01),
      pending: false,
    };
  }

  async getLPDepositStep(
    quote: ZapQuote,
    option: OneInchZapOptionLP,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectVaultById(state, option.vaultId);
    const input = first(quote.inputs);
    const swaps: ZapQuoteStepSwap[] = quote.steps.filter(isZapQuoteStepSwap);
    if (!swaps || !swaps.length) {
      throw new Error(`No swap steps in zap quote`);
    }

    return {
      step: 'deposit',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.oneInchBeefInLP(vault, input, swaps, option.zap, option.lpTokens, 0.01),
      pending: false,
    };
  }

  async getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    const vault = selectVaultById(state, vaultId);

    if (!isStandardVault(vault)) {
      console.debug(this.getId(), `${vaultId} only standard vaults supported`);
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
    if (!isTokenErc20(depositToken)) {
      console.debug(this.getId(), `zap from non-erc20 not supported`);
      return null;
    }

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      console.debug(this.getId(), `no 1inch zap for ${vault.chainId}`);
      return null;
    }

    const blockedToken = zap.blockedWithdrawFromTokens.find(id => depositToken.id === id);
    if (blockedToken !== undefined) {
      console.debug(
        this.getId(),
        `1inch zap for ${vault.chainId} blocks zapping from ${blockedToken}`
      );
      return null;
    }

    const zapTokens = zap.withdrawToTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => !!token && !isTokenEqual(token, depositToken));

    if (!zapTokens || zapTokens.length === 0) {
      console.debug(this.getId(), `no zap tokens for 1inch ${zap.chainId} zap`);
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
      console.debug(this.getId(), `only supports 2 asset lp vaults`);
      return null;
    }

    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        console.warn(this.getId(), `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      console.debug(this.getId(), `zap to non-erc20 not supported`);
      return null;
    }

    const zap = selectOneInchZapByChainId(state, vault.chainId);
    if (!zap) {
      console.debug(this.getId(), `no 1inch zap for ${vault.chainId}`);
      return null;
    }

    let amms = state.entities.amms.byChainId[vault.chainId];
    if (amms === undefined || amms.length === 0) {
      console.debug(
        this.getId(),
        `no amms for ${vault.chainId}`,
        state.entities.amms.byChainId[vault.chainId]
      );
      return null;
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    const lpTokens = tokensToLp(tokens, wnative);
    const lpTokenIds = lpTokens.map(token => token.id);

    const blockedToken = zap.blockedWithdrawFromTokens.find(id => lpTokenIds.includes(id));
    if (blockedToken !== undefined) {
      console.debug(
        this.getId(),
        `1inch zap for ${vault.chainId} blocks zapping from ${blockedToken}`
      );
      return null;
    }

    const amm = this.getAmm(amms, depositToken.address, lpTokens);
    if (!amm) {
      console.debug(this.getId(), `no amm has lp ${depositToken.address}`);
      return null;
    }

    const native = selectChainNativeToken(state, vault.chainId);
    const lpWithdrawTokens = tokensToZapWithdraw(lpTokens, wnative, native);
    const oneInchZapTokens = zap.withdrawToTokens
      .map(tokenId => selectTokenById(state, vault.chainId, tokenId))
      .filter(token => !!token && !isTokenEqual(token, depositToken));
    const zapTokens = uniqBy(lpWithdrawTokens.concat(oneInchZapTokens), token => token.id);

    if (!zapTokens || zapTokens.length === 0) {
      console.debug(this.getId(), `no zap tokens for 1inch ${zap.chainId} zap`);
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

  static async getWithdrawnFromState(
    userInput: InputTokenAmount,
    vault: VaultStandard,
    state: BeefyState
  ) {
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
    const ppfs = selectVaultPricePerFullShare(state, vault.id);
    const requestedWithdrawInDepositToken = userInput.amount;

    return OneInchZapProvider.getWithdrawnAmounts(
      requestedWithdrawInDepositToken,
      depositToken,
      mooToken,
      ppfs,
      vault.id,
      state
    );
  }

  static async getWithdrawnFromContract(
    userInput: InputTokenAmount,
    userAddress: string,
    vault: VaultStandard,
    state: BeefyState,
    web3: Web3,
    multicall: MultiCall
  ) {
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const mooToken = selectErc20TokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
    const vaultContract = new web3.eth.Contract(VaultAbi, vault.earnContractAddress);

    type MulticallReturnType = [
      [
        {
          ppfs: string;
          userBalance: string;
        }
      ]
    ];

    const [[vaultData]]: MulticallReturnType = (await multicall.all([
      [
        {
          ppfs: vaultContract.methods.getPricePerFullShare(),
          userBalance: vaultContract.methods.balanceOf(userAddress),
        },
      ],
    ])) as MulticallReturnType;

    const ppfs = fromWeiString(vaultData.ppfs, mooToken.decimals);
    const userBalanceInMooTokens = fromWeiString(vaultData.userBalance, mooToken.decimals);
    const userBalanceInDepositToken = userBalanceInMooTokens
      .multipliedBy(ppfs)
      .decimalPlaces(depositToken.decimals);
    const requestedWithdrawInDepositToken = userInput.max
      ? userBalanceInDepositToken
      : userInput.amount;

    return OneInchZapProvider.getWithdrawnAmounts(
      requestedWithdrawInDepositToken,
      depositToken,
      mooToken,
      ppfs,
      vault.id,
      state
    );
  }

  /**
   * User inputs amount of want, but contract needs amount of mooTokens and 1inch needs want value of those mooTokens
   */
  static async getWithdrawnAmounts(
    requestedWithdrawInDepositToken: BigNumber,
    depositToken: TokenEntity,
    mooToken: TokenErc20,
    ppfs: BigNumber,
    vaultId: string,
    state: BeefyState
  ) {
    const mooTokensToWithdraw = requestedWithdrawInDepositToken
      .dividedBy(ppfs)
      .decimalPlaces(mooToken.decimals);
    const depositTokensToWithdraw = mooTokensToWithdraw
      .multipliedBy(ppfs)
      .decimalPlaces(depositToken.decimals);

    const vaultFees = selectFeesByVaultId(state, vaultId);
    const withdrawFee = vaultFees.withdraw || 0;
    const feeInMooTokens = mooTokensToWithdraw
      .multipliedBy(withdrawFee)
      .decimalPlaces(mooToken.decimals);
    const mooTokensWithdrawnAfterFee = mooTokensToWithdraw.minus(feeInMooTokens);
    const depositTokensWithdrawnAfterFee = mooTokensWithdrawnAfterFee
      .multipliedBy(ppfs)
      .decimalPlaces(depositToken.decimals);

    return {
      depositToken,
      mooToken,
      mooTokensToWithdraw,
      depositTokensToWithdraw,
      depositTokensWithdrawnAfterFee,
    };
  }

  async getSingleWithdrawQuoteFor(
    option: OneInchZapOptionSingle,
    userInput: InputTokenAmount,
    state: BeefyState
  ): Promise<TransactQuote | null> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const {
      depositToken,
      mooToken,
      mooTokensToWithdraw,
      depositTokensToWithdraw,
      depositTokensWithdrawnAfterFee,
    } = await OneInchZapProvider.getWithdrawnFromState(userInput, vault, state);

    if (!isTokenEqual(depositToken, userInput.token)) {
      throw new Error(`Invalid input token ${userInput.token.symbol}`);
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const native = selectChainNativeToken(state, vault.chainId);

    const swapTokenIn = nativeToWNative(userInput.token, wnative);
    const swapTokenInAddress = swapTokenIn.address;
    const swapAmountIn = depositTokensWithdrawnAfterFee;
    const swapAmountInWei = toWeiString(swapAmountIn, swapTokenIn.decimals);

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

    console.warn(apiQuote);

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

    const inputValue = selectTokenAmountValue(state, {
      amount: swapAmountIn,
      token: swapTokenIn,
    });
    const outputValue = selectTokenAmountValue(state, {
      amount: swapAmountOut,
      token: swapTokenOut,
    });
    const priceImpact = BIG_ONE.minus(
      BigNumber.min(outputValue.dividedBy(inputValue), BIG_ONE)
    ).toNumber();

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      allowances: [
        {
          token: mooToken,
          amount: mooTokensToWithdraw,
          spenderAddress: option.zap.zapAddress,
        },
      ],
      inputs: [
        {
          token: depositToken,
          amount: depositTokensToWithdraw,
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
  ): Promise<TransactQuote | null> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const {
      depositToken,
      mooToken,
      mooTokensToWithdraw,
      depositTokensToWithdraw,
      depositTokensWithdrawnAfterFee,
    } = await OneInchZapProvider.getWithdrawnFromState(userInput, vault, state);

    if (!isTokenEqual(depositToken, userInput.token)) {
      throw new Error(`Invalid input token ${userInput.token.symbol}`);
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const native = selectChainNativeToken(state, vault.chainId);
    const chain = selectChainById(state, vault.chainId);
    const wantedTokenOut = selectTokenByAddress(state, option.chainId, option.tokenAddresses[0]);
    const actualTokenOut = wnativeToNative(wantedTokenOut, wnative, native); // zap always converts wnative to native
    const swapTokenOut = nativeToWNative(wantedTokenOut, wnative); // swaps are always between erc20
    const mooTokensToWithdrawWei = toWeiString(mooTokensToWithdraw, mooToken.decimals);
    const [web3, api] = await Promise.all([getWeb3Instance(chain), getOneInchApi(chain)]);
    const zapContract = new web3.eth.Contract(BeefyZapOneInchAbi, option.zap.zapAddress);
    const swapTokensIn = option.lpTokens;
    const swapAmountsIn = await OneInchZapProvider.quoteRemoveLiquidity(
      zapContract,
      vault.earnContractAddress,
      mooTokensToWithdrawWei,
      option.lpTokens
    );
    const swapAmountsOut = await Promise.all(
      swapAmountsIn.map((amountIn, i) =>
        this.getQuoteIfNeeded(api, amountIn, swapTokensIn[i], swapTokenOut)
      )
    );
    let totalOut = BIG_ZERO;
    const swaps: ZapQuoteStepSwap[] = swapAmountsOut
      .map((amountOut, i) => {
        // null amount out means no swap needed (swap in token is one of the lp tokens)
        if (amountOut) {
          totalOut = totalOut.plus(amountOut);
          return {
            type: 'swap' as const,
            fromToken: swapTokensIn[i],
            fromAmount: swapAmountsIn[i],
            toToken: swapTokenOut,
            toAmount: amountOut,
            priceImpact: this.getPriceImpact(
              state,
              swapAmountsIn[i],
              swapTokensIn[i],
              amountOut,
              swapTokenOut
            ),
          };
        }

        totalOut = totalOut.plus(swapAmountsIn[i]);
        return null;
      })
      .filter(swap => !!swap);
    const maxPriceImpact = Math.max(...swaps.map(swap => swap.priceImpact));

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      allowances: [
        {
          token: mooToken,
          amount: mooTokensToWithdraw,
          spenderAddress: option.zap.zapAddress,
        },
      ],
      inputs: [
        {
          token: depositToken,
          amount: depositTokensToWithdraw,
          max: userInput.max,
        },
      ],
      outputs: [
        {
          token: actualTokenOut,
          amount: totalOut,
        },
      ],
      priceImpact: maxPriceImpact,
      steps: [
        {
          type: 'split',
          inputToken: depositToken,
          inputAmount: depositTokensWithdrawnAfterFee,
          outputs: [
            {
              token: swapTokensIn[0],
              amount: swapAmountsIn[0],
            },
            {
              token: swapTokensIn[1],
              amount: swapAmountsIn[1],
            },
          ],
        },
        ...swaps,
      ],
    };
  }

  static async quoteRemoveLiquidity(
    zapContract: InstanceType<Web3['eth']['Contract']>,
    vaultAddress: string,
    mooTokensInWei: string,
    lpTokens: TokenErc20[]
  ): Promise<[BigNumber, BigNumber]> {
    const raw = await zapContract.methods.quoteRemoveLiquidity(vaultAddress, mooTokensInWei).call();

    return [
      fromWeiString(raw.amt0, lpTokens[0].decimals),
      fromWeiString(raw.amt1, lpTokens[1].decimals),
    ];
  }

  async getWithdrawStep(
    quote: ZapQuote,
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
    quote: ZapQuote,
    option: OneInchZapOptionSingle,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const input = first(quote.inputs);
    const swap = quote.steps.find(step => isZapQuoteStepSwap(step));
    if (!swap || !isZapQuoteStepSwap(swap)) {
      throw new Error(`No swap step in zap quote`);
    }

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.oneInchBeefOutSingle(vault, input, swap, option.zap, 0.01),
      pending: false,
      extraInfo: { zap: true },
    };
  }

  async getLPWithdrawStep(
    quote: ZapQuote,
    option: OneInchZapOptionLP,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const input = first(quote.inputs);
    const swaps = quote.steps.filter(isZapQuoteStepSwap);
    if (!swaps || !swaps.length) {
      throw new Error(`No swap steps in zap quote`);
    }

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.oneInchBeefOutLP(
        vault,
        input,
        swaps,
        option.zap,
        option.lpTokens,
        0.01
      ),
      pending: false,
      extraInfo: { zap: true },
    };
  }
}

function isOneInchOption(option: TransactOption): option is OneInchZapOption {
  return option.type === 'zap' && option.providerId === '1inch';
}

function isSingleOption(option: TransactOption): option is OneInchZapOptionSingle {
  return isOneInchOption(option) && option.subtype === 'single';
}

function isLPOption(option: TransactOption): option is OneInchZapOptionLP {
  return isOneInchOption(option) && option.subtype === 'lp';
}
