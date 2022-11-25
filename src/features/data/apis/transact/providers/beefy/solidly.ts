import {
  BeefyBaseZapProvider,
  CommonDepositQuoteOptions,
  CommonWithdrawQuoteOptions,
} from './base';
import { isTokenErc20, TokenEntity, TokenErc20 } from '../../../../entities/token';
import {
  calculateSwap,
  computeSolidlyPairAddress,
  MetadataRaw,
  metadataToObject,
} from '../../helpers/solidly';
import { AllowanceTokenAmount, ZapQuote } from '../../transact-types';
import { SolidlyPairAbi, ZapAbi } from '../../../../../../config/abi';
import BigNumber from 'bignumber.js';
import { getOptimalAddLiquidityAmounts, quoteMint } from '../../helpers/uniswapv2';
import { createQuoteId } from '../../utils';
import { fromWei, toWei } from '../../../../../../helpers/big-number';
import { wnativeToNative } from '../../helpers/tokens';
import { AmmEntity } from '../../../../entities/amm';

/**
 * Deposit/withdraw to Solidly-type vaults via Beefy Zap Contracts
 */
export class BeefySolidlyZapProvider extends BeefyBaseZapProvider {
  constructor() {
    super('solidly');
  }

  getAmm(
    amms: AmmEntity[],
    depositTokenAddress: TokenEntity['address'],
    lpTokens: TokenEntity[]
  ): AmmEntity | null {
    const amm = amms.find(
      amm =>
        amm.type === this.type &&
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
            ))
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
    const pairContract = new web3.eth.Contract(SolidlyPairAbi, depositToken.address);
    const zapContract = new web3.eth.Contract(ZapAbi, option.zap.zapAddress);

    console.debug(this.getId(), 'swapTokenIn', swapTokenIn);
    console.debug(this.getId(), 'swapTokenOut', swapTokenOut);

    console.debug(this.getId(), `user has ${userAmountInWei.toString(10)} of IN`);

    type MulticallReturnType = [
      [
        {
          metadata: MetadataRaw;
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
          metadata: pairContract.methods.metadata(),
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

    if (!zap.estimate || !pair.metadata) {
      throw new Error(`Failed to estimate swap.`);
    }

    // before swap
    const metadata = metadataToObject(pair.metadata);
    const token0 = metadata.token0;
    const totalSupply = new BigNumber(pair.totalSupply);
    const inIsToken0 = swapTokenIn.address.toLowerCase() === token0.toLowerCase();
    const reserves0 = metadata.reserves0;
    const reserves1 = metadata.reserves1;
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
    const swapAmountInAfterFee = swapAmountIn
      .minus(swapAmountIn.multipliedBy(option.amm.swapFee))
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const metadataAfterSwap = {
      ...metadata,
      reserves0: inIsToken0 ? reservesInAfter : reservesOutAfter,
      reserves1: inIsToken0 ? reservesOutAfter : reservesInAfter,
    };
    const { priceImpact, amountOut } = calculateSwap(
      swapAmountInAfterFee,
      swapTokenIn.address,
      metadataAfterSwap
    );

    console.debug(
      this.getId(),
      `swap ${swapAmountIn.toString(10)} IN to ${swapAmountOut.toString(10)} OUT`,
      `${amountOut.toString(10)} LOCAL`
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
    const pairContract = new web3.eth.Contract(SolidlyPairAbi, depositToken.address);

    type MulticallReturnType = [
      [
        {
          metadata: MetadataRaw;
          totalSupply: string;
          decimals: string;
        }
      ],
      [
        {
          estimate: Record<number, string>;
        }
      ]
    ];

    const [[pair]]: MulticallReturnType = (await multicall.all([
      [
        {
          metadata: pairContract.methods.metadata(),
          totalSupply: pairContract.methods.totalSupply(),
          decimals: pairContract.methods.decimals(),
        },
      ],
    ])) as MulticallReturnType;

    if (!pair || !pair.metadata) {
      throw new Error(`Failed to estimate swap.`);
    }

    // withdrawing and splitting lp
    const metadata = metadataToObject(pair.metadata);
    const { token0, token1, reserves0, reserves1 } = metadata;
    const totalSupply = new BigNumber(pair.totalSupply);
    const equityRatio = toWei(userInput.amount, userInput.token.decimals).dividedBy(totalSupply);
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

    const allowances: AllowanceTokenAmount[] = [
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

    if (option.amm.getAmountOutMode !== 'getAmountOut') {
      throw new Error(
        `getAmountOutMode ${option.amm.getAmountOutMode} not implemented for Solidly zap.`
      );
    }

    // swap
    const inIsToken0 = swapTokenIn.address.toLowerCase() === token0.toLowerCase();
    const withdrawnIn = inIsToken0 ? withdrawn0 : withdrawn1;
    const withdrawnOut = inIsToken0 ? withdrawn1 : withdrawn0;
    const swapAmountIn = withdrawnIn;
    const swapAmountInAfterFee = swapAmountIn
      .minus(swapAmountIn.multipliedBy(option.amm.swapFee))
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const { priceImpact, amountOut: swapAmountOut } = calculateSwap(
      swapAmountInAfterFee,
      swapTokenIn.address,
      metadata
    );

    console.debug(
      this.getId(),
      `swap ${swapAmountIn.toString(10)} IN to ${swapAmountOut.toString(10)} OUT`
    );

    // after swap
    const balanceOutAfter = withdrawnOut.plus(swapAmountOut);

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
