import {
  BeefyBaseZapProvider,
  CommonDepositQuoteOptions,
  CommonWithdrawQuoteOptions,
} from './base';
import { AmmEntity } from '../../../../entities/amm';
import { isTokenErc20, TokenEntity, TokenErc20 } from '../../../../entities/token';
import { ZapQuote } from '../../transact-types';
import { UniswapV2PairAbi, UniswapV2RouterAbi, ZapAbi } from '../../../../../../config/abi';
import BigNumber from 'bignumber.js';
import { calculatePriceImpact } from '../../../../utils/zap-utils';
import {
  computeUniswapV2PairAddress,
  getOptimalAddLiquidityAmounts,
  quoteMint,
} from '../../helpers/uniswapv2';
import { createQuoteId } from '../../utils';
import { fromWei, toWei } from '../../../../../../helpers/big-number';
import { wnativeToNative } from '../../helpers/tokens';

/**
 * Deposit/withdraw to UniswapV2-type vaults via Beefy Zap Contracts
 */
export class BeefyUniswapV2ZapProvider extends BeefyBaseZapProvider {
  constructor() {
    super('uniswapv2');
  }

  getAmm(
    amms: AmmEntity[],
    depositTokenAddress: TokenEntity['address'],
    lpTokens: TokenEntity[]
  ): AmmEntity | null {
    const amm = amms.find(
      amm =>
        amm.type === this.type &&
        depositTokenAddress ===
          computeUniswapV2PairAddress(
            amm.factoryAddress,
            amm.pairInitHash,
            lpTokens[0].address,
            lpTokens[1].address
          )
    );

    return amm || null;
  }

  async getDepositQuoteForType({
    web3,
    multicall,
    depositToken,
    swapTokenIn,
    swapTokenOut,
    userAmountInWei,
    option,
    vault,
    userInput,
    amounts,
  }: CommonDepositQuoteOptions): Promise<ZapQuote | null> {
    const pairContract = new web3.eth.Contract(UniswapV2PairAbi, depositToken.address);
    const zapContract = new web3.eth.Contract(ZapAbi, option.zap.zapAddress);

    console.debug(this.getId(), 'swapTokenIn', swapTokenIn);
    console.debug(this.getId(), 'swapTokenOut', swapTokenOut);

    console.debug(this.getId(), `user has ${userAmountInWei.toString(10)} of IN`);

    type MulticallReturnType = [
      [
        {
          token0: string;
          token1: string;
          reserves: Record<number, string>;
          totalSupply: string;
        }
      ],
      [
        {
          estimate: Record<number, string>;
        }
      ]
    ];

    console.debug(
      this.getId(),
      `estimateSwap on ${option.zap.zapAddress}:`,
      vault.earnContractAddress,
      swapTokenIn.address,
      userAmountInWei.toString(10)
    );
    const [[pair], [zap]]: MulticallReturnType = (await multicall.all([
      [
        {
          token0: pairContract.methods.token0(),
          token1: pairContract.methods.token1(),
          reserves: pairContract.methods.getReserves(),
          totalSupply: pairContract.methods.totalSupply(),
        },
      ],
      [
        {
          estimate: zapContract.methods.estimateSwap(
            vault.earnContractAddress,
            swapTokenIn.address,
            userAmountInWei.toString(10)
          ),
        },
      ],
    ])) as MulticallReturnType;

    if (!zap.estimate) {
      throw new Error(`Failed to estimate swap.`);
    }

    // before swap
    const token0 = pair.token0;
    const totalSupply = new BigNumber(pair.totalSupply);
    const inIsToken0 = swapTokenIn.address.toLowerCase() === token0.toLowerCase();
    const [reserves0, reserves1] = Object.values(pair.reserves)
      .slice(0, 2)
      .map(amount => new BigNumber(amount));
    const reservesIn = inIsToken0 ? reserves0 : reserves1;
    const reservesOut = inIsToken0 ? reserves1 : reserves0;

    // after swap
    const [swapAmountIn, swapAmountOut] = Object.values(zap.estimate)
      .slice(0, 2)
      .map(amount => new BigNumber(amount));
    const reservesInAfter = reservesIn.plus(swapAmountIn);
    const reservesOutAfter = reservesOut.minus(swapAmountOut);
    const balanceInAfter = userAmountInWei.minus(swapAmountIn);
    const balanceOutAfter = swapAmountOut;
    const priceImpact = calculatePriceImpact(swapAmountIn, reservesIn, option.amm.swapFee);
    console.debug(
      this.getId(),
      `swap ${swapAmountIn.toString(10)} IN to ${swapAmountOut.toString(10)} OUT`
    );
    console.debug(
      this.getId(),
      `user now has ${balanceInAfter.toString(10)} IN and ${balanceOutAfter.toString(10)} OUT`
    );

    // add liquidity
    const { amount0: addInAmount, amount1: addOutAmount } = getOptimalAddLiquidityAmounts(
      balanceInAfter,
      balanceOutAfter,
      reservesInAfter,
      reservesOutAfter
    );
    console.debug(
      this.getId(),
      `add ${addInAmount.toString(10)} IN and ${addOutAmount.toString(10)} OUT liquidity`
    );
    const liquidity = quoteMint(
      addInAmount,
      addOutAmount,
      reservesInAfter,
      reservesOutAfter,
      totalSupply
    );
    console.debug(this.getId(), `get ${liquidity.toString(10)} lp tokens`);

    // after add liquidity
    const dustIn = balanceInAfter.minus(addInAmount);
    const dustOut = balanceOutAfter.minus(addOutAmount);

    console.debug(
      this.getId(),
      `user now has ${dustIn.toString(10)} IN and ${dustOut.toString(10)} OUT dust`
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
          amount: fromWei(liquidity, depositToken.decimals),
        },
      ],
      priceImpact,
      steps: [
        {
          type: 'swap',
          fromToken: swapTokenIn,
          fromAmount: fromWei(swapAmountIn, swapTokenIn.decimals),
          toToken: swapTokenOut,
          toAmount: fromWei(swapAmountOut, swapTokenOut.decimals),
          priceImpact,
        },
        {
          type: 'build',
          inputs: [
            {
              token: swapTokenIn,
              amount: fromWei(addInAmount, swapTokenIn.decimals),
            },
            {
              token: swapTokenOut,
              amount: fromWei(addOutAmount, swapTokenOut.decimals),
            },
          ],
          outputToken: depositToken,
          outputAmount: fromWei(liquidity, depositToken.decimals),
        },
        {
          type: 'deposit',
          token: depositToken,
          amount: fromWei(liquidity, depositToken.decimals),
        },
        // {
        //   type: 'dust',
        //   token0: swapTokenIn,
        //   amount0: fromWei(dustIn, swapTokenIn.decimals),
        //   token1: swapTokenOut,
        //   amount1: fromWei(dustOut, swapTokenOut.decimals),
        // },
      ],
    };
  }

  async getWithdrawQuoteForType({
    web3,
    multicall,
    mooToken,
    depositToken,
    wantedTokenOut,
    swapTokenIn,
    swapTokenOut,
    option,
    vault,
    userInput,
    amounts,
    userAmountInMooToken,
    native,
    wnative,
  }: CommonWithdrawQuoteOptions): Promise<ZapQuote | null> {
    const pairContract = new web3.eth.Contract(UniswapV2PairAbi, depositToken.address);

    type MulticallReturnType = [
      [
        {
          totalSupply: string;
          decimals: string;
          token0: string;
          token1: string;
          reserves: Record<number, string>;
        }
      ]
    ];

    const [[pair]]: MulticallReturnType = (await multicall.all([
      [
        {
          totalSupply: pairContract.methods.totalSupply(),
          decimals: pairContract.methods.decimals(),
          token0: pairContract.methods.token0(),
          token1: pairContract.methods.token1(),
          reserves: pairContract.methods.getReserves(),
        },
      ],
    ])) as MulticallReturnType;

    if (!pair || !pair.token0) {
      throw new Error(`Failed to estimate swap.`);
    }

    // withdrawing and splitting lp
    const token0 = pair.token0;
    const token1 = pair.token1;
    const totalSupply = new BigNumber(pair.totalSupply);
    const equityRatio = toWei(userInput.amount, userInput.token.decimals).dividedBy(totalSupply);
    const [reserves0, reserves1] = Object.values(pair.reserves)
      .slice(0, 2)
      .map(amount => new BigNumber(amount));
    const withdrawn0 = reserves0.multipliedBy(equityRatio).decimalPlaces(0, BigNumber.ROUND_DOWN);
    const withdrawn1 = reserves1.multipliedBy(equityRatio).decimalPlaces(0, BigNumber.ROUND_DOWN);
    const withdrawnToken0 = option.lpTokens.find(
      token => token.address.toLowerCase() === token0.toLowerCase()
    );
    const withdrawnToken1 = option.lpTokens.find(
      token => token.address.toLowerCase() === token1.toLowerCase()
    );

    if (!withdrawnToken0 || !withdrawnToken1) {
      throw new Error(`LP token mismatch`);
    }

    const allowances = [
      {
        token: mooToken,
        amount: userAmountInMooToken,
        spenderAddress: option.zap.zapAddress,
      },
    ];

    // split only
    if (swapTokenIn === null) {
      return {
        id: createQuoteId(option.id),
        optionId: option.id,
        type: 'zap',
        allowances,
        inputs: amounts,
        outputs: [
          {
            token: wnativeToNative(withdrawnToken0, wnative, native),
            amount: fromWei(withdrawn0, withdrawnToken0.decimals),
          },
          {
            token: wnativeToNative(withdrawnToken1, wnative, native),
            amount: fromWei(withdrawn1, withdrawnToken1.decimals),
          },
        ],
        priceImpact: 0,
        steps: [
          {
            type: 'split',
            inputToken: userInput.token,
            inputAmount: userInput.amount,
            outputs: [
              {
                token: withdrawnToken0,
                amount: fromWei(withdrawn0, withdrawnToken0.decimals),
              },
              {
                token: withdrawnToken1,
                amount: fromWei(withdrawn1, withdrawnToken1.decimals),
              },
            ],
          },
        ],
      };
    }

    // swap
    const inIsToken0 = swapTokenIn.address.toLowerCase() === token0.toLowerCase();
    const reservesIn = inIsToken0 ? reserves0 : reserves1;
    const reservesOut = inIsToken0 ? reserves1 : reserves0;
    const withdrawnIn = inIsToken0 ? withdrawn0 : withdrawn1;
    const withdrawnOut = inIsToken0 ? withdrawn1 : withdrawn0;
    const routerContract = new web3.eth.Contract(UniswapV2RouterAbi, option.amm.routerAddress);
    const swapAmountIn = withdrawnIn;

    // getAmountsOut vs getAmountOut
    let swapAmountOut;
    switch (option.amm.getAmountOutMode) {
      // getAmountOut with static fee param
      case 'getAmountOutWithFee': {
        swapAmountOut = new BigNumber(
          await routerContract.methods
            .getAmountOut(
              swapAmountIn.toString(10),
              reservesIn.toString(10),
              reservesOut.toString(10),
              option.amm.getAmountOutFee
            )
            .call()
        );
        break;
      }
      // getAmountsOut: takes a path
      case 'getAmountsOut': {
        const amountsOut = await routerContract.methods
          .getAmountsOut(swapAmountIn.toString(10), [swapTokenIn.address, swapTokenOut.address])
          .call();
        swapAmountOut = new BigNumber(amountsOut[1]);
        break;
      }
      // getAmountOut: no fee param needed
      default: {
        swapAmountOut = new BigNumber(
          await routerContract.methods
            .getAmountOut(
              swapAmountIn.toString(10),
              reservesIn.toString(10),
              reservesOut.toString(10)
            )
            .call()
        );
        break;
      }
    }

    // after swap
    const balanceInAfter = withdrawnIn.minus(swapAmountIn);
    const balanceOutAfter = withdrawnOut.plus(swapAmountOut);
    const priceImpact = calculatePriceImpact(swapAmountIn, reservesIn, option.amm.swapFee);
    console.debug(
      this.getId(),
      `swap ${swapAmountIn.toString(10)} IN to ${swapAmountOut.toString(10)} OUT`
    );
    console.debug(
      this.getId(),
      `user now has ${balanceInAfter.toString(10)} IN and ${balanceOutAfter.toString(10)} OUT`
    );

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      allowances: allowances,
      inputs: amounts,
      outputs: [
        {
          token: wnativeToNative(wantedTokenOut, wnative, native),
          amount: fromWei(balanceOutAfter, swapTokenOut.decimals),
        },
      ],
      priceImpact,
      steps: [
        {
          type: 'split',
          inputToken: userInput.token,
          inputAmount: userInput.amount,
          outputs: [
            {
              token: withdrawnToken0,
              amount: fromWei(withdrawn0, withdrawnToken0.decimals),
            },
            {
              token: withdrawnToken1,
              amount: fromWei(withdrawn1, withdrawnToken1.decimals),
            },
          ],
        },
        {
          type: 'swap',
          fromToken: swapTokenIn,
          fromAmount: fromWei(swapAmountIn, swapTokenIn.decimals),
          toToken: swapTokenOut,
          toAmount: fromWei(swapAmountOut, swapTokenOut.decimals),
          priceImpact,
        },
      ],
    };
  }
}
