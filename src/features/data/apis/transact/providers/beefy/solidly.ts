import {
  BeefyBaseZapProvider,
  CommonDepositQuoteOptions,
  CommonWithdrawQuoteOptions,
} from './base';
import { isTokenErc20, TokenEntity, TokenErc20 } from '../../../../entities/token';
import { computeSolidlyPairAddress } from '../../helpers/solidly';
import { ZapQuote, ZapQuoteStepSplit } from '../../transact-types';
import { ZapAbi } from '../../../../../../config/abi';
import BigNumber from 'bignumber.js';
import { createQuoteId } from '../../utils';
import { fromWei } from '../../../../../../helpers/big-number';
import { wnativeToNative } from '../../helpers/tokens';
import { AmmEntity, AmmEntitySolidly } from '../../../../entities/amm';
import { getPool } from '../../../amm';

/**
 * Deposit/withdraw to Solidly-type vaults via Beefy Zap Contracts
 */
export class BeefySolidlyZapProvider extends BeefyBaseZapProvider<AmmEntitySolidly> {
  constructor() {
    super('solidly');
  }

  getAmm(
    amms: AmmEntity[],
    depositTokenAddress: TokenEntity['address'],
    lpTokens: TokenEntity[]
  ): AmmEntitySolidly | null {
    const amm = amms.find(
      (amm): amm is AmmEntitySolidly =>
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
    chain,
    depositToken,
    swapTokenIn,
    swapTokenOut,
    userAmountInWei,
    option,
    vault,
    userInput,
    amounts,
  }: CommonDepositQuoteOptions<AmmEntitySolidly>): Promise<ZapQuote | null> {
    const lp = getPool(depositToken.address, option.amm, chain);
    const zapContract = new web3.eth.Contract(ZapAbi, option.zap.zapAddress);

    type MulticallReturnType = [
      [
        {
          estimate: Record<number, string>;
        }
      ]
    ];

    const [[zap]]: MulticallReturnType = (await lp.updateAllData([
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

    const swapAmountIn = new BigNumber(zap.estimate[0]);
    const restAmountIn = userAmountInWei.minus(swapAmountIn);
    const { amountOut: swapAmountOut, priceImpact } = lp.swap(
      swapAmountIn,
      swapTokenIn.address,
      true
    );
    const {
      addAmountA: addInAmount,
      addAmountB: addOutAmount,
      liquidity,
    } = lp.addLiquidity(restAmountIn, swapTokenIn.address, swapAmountOut);

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
      ],
    };
  }

  async getWithdrawQuoteForType({
    web3,
    multicall,
    chain,
    withdrawnToken,
    withdrawnAmountAfterFeeWei,
    shareToken,
    sharesToWithdrawWei,
    actualTokenOut,
    swapTokenIn,
    swapTokenOut,
    option,
    vault,
    amounts,
    native,
    wnative,
  }: CommonWithdrawQuoteOptions<AmmEntitySolidly>): Promise<ZapQuote | null> {
    const lp = getPool(withdrawnToken.address, option.amm, chain);
    await lp.updateAllData();

    // withdrawing and splitting lp
    const {
      amount0: withdrawn0,
      amount1: withdrawn1,
      token0,
      token1,
    } = lp.removeLiquidity(withdrawnAmountAfterFeeWei, true);

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
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: option.zap.zapAddress,
      },
    ];

    const splitStep: ZapQuoteStepSplit = {
      type: 'split',
      inputToken: withdrawnToken,
      inputAmount: fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals),
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
    };

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
        steps: [splitStep],
      };
    }

    // swap
    const inIsToken0 = swapTokenIn.address.toLowerCase() === token0.toLowerCase();
    const withdrawnIn = inIsToken0 ? withdrawn0 : withdrawn1;
    const withdrawnOut = inIsToken0 ? withdrawn1 : withdrawn0;
    const swapAmountIn = withdrawnIn;
    const { amountOut: swapAmountOut, priceImpact } = lp.swap(swapAmountIn, swapTokenIn.address);
    const balanceOutAfter = withdrawnOut.plus(swapAmountOut);

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      allowances: allowances,
      inputs: amounts,
      outputs: [
        {
          token: actualTokenOut,
          amount: fromWei(balanceOutAfter, swapTokenOut.decimals),
        },
      ],
      priceImpact,
      steps: [
        splitStep,
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
