import type { ChainEntity } from '../../entities/chain.ts';
import { BeefyCowcentratedLiquidityStrategyAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityStrategyAbi.ts';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityVaultAbi.ts';
import BigNumber from 'bignumber.js';
import { isTokenEqual, type TokenEntity } from '../../entities/token.ts';
import type { InputTokenAmount, TokenAmount } from '../transact/transact-types.ts';
import {
  BIG_ONE,
  BIG_ZERO,
  bigNumberToBigInt,
  fromWei,
  toWei,
} from '../../../../helpers/big-number.ts';
import { fetchContract } from '../rpc-contract/viem-contract.ts';

export class BeefyCLMPool {
  public readonly type = 'uniswap-v2';

  protected readonly PRECISION = 1e36;

  constructor(
    protected address: string,
    protected strategy: string,
    protected chain: ChainEntity,
    protected tokens: TokenEntity[]
  ) {}

  public async getDepositRatioData(
    inputToken: InputTokenAmount,
    inputTokenPrice: BigNumber,
    token1Price: BigNumber
  ) {
    const strategyContract = fetchContract(
      this.strategy,
      BeefyCowcentratedLiquidityStrategyAbi,
      this.chain.id
    );
    const clmContract = fetchContract(
      this.address,
      BeefyCowcentratedLiquidityVaultAbi,
      this.chain.id
    );

    const [priceResult, balanceResults] = await Promise.all([
      strategyContract.read.price(),
      clmContract.read.balances(),
    ]);

    const [balance0, balance1] = [
      new BigNumber(balanceResults[0].toString(10)),
      new BigNumber(balanceResults[1].toString(10)),
    ];
    const price = new BigNumber(priceResult.toString(10));
    const bal0inToken1 = balance0.times(price).div(this.PRECISION);

    const balancingAmount: TokenAmount =
      balance1.gt(bal0inToken1) ?
        {
          token: this.tokens[0],
          amount: balance1.minus(bal0inToken1).times(this.PRECISION).div(price),
        }
      : {
          token: this.tokens[1],
          amount: bal0inToken1.minus(balance1),
        };

    // If the input token is one of these tokens we can calculate amounts based off clm price ratio
    const inputAmountInWei = toWei(inputToken.amount, inputToken.token.decimals);

    // (1) X = Y * precision / price
    // (2) X + Y * precision / price = remainingInputAmout
    // (2-i) Y = (remainingInputAmout - X) * price / precision
    // (3) X = (remainingInputAmout - X) * price / precision * precision / (price + precision)
    // (3-i) X = remainingInputAmout - X
    // (4) X = remainingInputAmount /2 = > jajjs lol of course it's half to one token i'm an idiot

    // If we are depositing token0
    if (isTokenEqual(inputToken.token, this.tokens[0])) {
      if (isTokenEqual(balancingAmount.token, inputToken.token)) {
        if (inputAmountInWei.lte(balancingAmount.amount)) {
          // return [inputAmountInWei, BIG_ZERO];
          return [BIG_ONE, BIG_ZERO];
        } else {
          const amountToBalance = balancingAmount.amount;
          const remainingInputAmout = inputAmountInWei.minus(amountToBalance);

          const extraAmountOftoken0 = remainingInputAmout.div(2);
          const extraAmountOftoken1 = remainingInputAmout.div(2);

          const total = amountToBalance.plus(extraAmountOftoken0).plus(extraAmountOftoken1);
          return [
            amountToBalance.plus(extraAmountOftoken0).div(total),
            extraAmountOftoken1.div(total),
          ];
        }
      } else {
        //convert to token1
        const inputAmountInBalance1 = inputAmountInWei.times(price).div(this.PRECISION);

        if (inputAmountInBalance1.lte(balancingAmount.amount)) {
          return [BIG_ZERO, BIG_ONE];
        } else {
          const amountToBalance = balancingAmount.amount;
          const remainingInputAmout = inputAmountInBalance1.minus(amountToBalance);

          const extraAmountOftoken0 = remainingInputAmout.div(2);
          const extraAmountOftoken1 = remainingInputAmout.div(2);

          const total = amountToBalance.plus(extraAmountOftoken0).plus(extraAmountOftoken1);
          return [
            extraAmountOftoken0.div(total),
            amountToBalance.plus(extraAmountOftoken1).div(total),
          ];
        }
      }
    }

    // If we are depositing token1
    if (isTokenEqual(inputToken.token, this.tokens[1])) {
      if (isTokenEqual(balancingAmount.token, inputToken.token)) {
        if (inputAmountInWei.lte(balancingAmount.amount)) {
          return [BIG_ZERO, BIG_ONE];
        } else {
          const amountToBalance = balancingAmount.amount;
          const remainingInputAmout = inputAmountInWei.minus(amountToBalance);

          const extraAmountOftoken0 = remainingInputAmout.div(2);
          const extraAmountOftoken1 = remainingInputAmout.div(2);

          const total = amountToBalance.plus(extraAmountOftoken0).plus(extraAmountOftoken1);
          return [
            extraAmountOftoken0.div(total),
            amountToBalance.plus(extraAmountOftoken1).div(total),
          ];
        }
      } else {
        //convert to token0
        const inputAmountInBalance0 = inputAmountInWei.times(this.PRECISION).div(price);
        if (inputAmountInBalance0.lte(balancingAmount.amount)) {
          return [BIG_ONE, BIG_ZERO];
        } else {
          const amountToBalance = balancingAmount.amount;
          const remainingInputAmout = inputAmountInBalance0.minus(amountToBalance);

          const extraAmountOftoken0 = remainingInputAmout.div(2);
          const extraAmountOftoken1 = remainingInputAmout.div(2);

          const total = amountToBalance.plus(extraAmountOftoken0).plus(extraAmountOftoken1);
          return [
            amountToBalance.plus(extraAmountOftoken0).div(total),
            extraAmountOftoken1.div(total),
          ];
        }
      }
    }

    // If the input token is a different token we estimate based on local prices and convert to token1
    const inputAmountInBalance1 = inputTokenPrice
      .shiftedBy(-inputToken.token.decimals)
      .times(inputAmountInWei)
      .div(token1Price.shiftedBy(-this.tokens[1].decimals));
    if (isTokenEqual(balancingAmount.token, this.tokens[1])) {
      if (inputAmountInBalance1.lte(balancingAmount.amount)) {
        return [BIG_ZERO, BIG_ONE];
      } else {
        const amountToBalance = balancingAmount.amount;
        const remainingInputAmout = inputAmountInBalance1.minus(amountToBalance);

        const extraAmountOftoken0 = remainingInputAmout.div(2);
        const extraAmountOftoken1 = remainingInputAmout.div(2);

        const total = amountToBalance.plus(extraAmountOftoken0).plus(extraAmountOftoken1);
        return [
          extraAmountOftoken0.div(total),
          amountToBalance.plus(extraAmountOftoken1).div(total),
        ];
      }
    } else {
      //convert to token0
      const inputAmountInBalance0 = inputAmountInBalance1.times(this.PRECISION).div(price);
      if (inputAmountInBalance0.lte(balancingAmount.amount)) {
        return [BIG_ONE, BIG_ZERO];
      } else {
        const amountToBalance = balancingAmount.amount;
        const remainingInputAmout = inputAmountInBalance0.minus(amountToBalance);

        const extraAmountOftoken0 = remainingInputAmout.div(2);
        const extraAmountOftoken1 = remainingInputAmout.div(2);

        const total = amountToBalance.plus(extraAmountOftoken0).plus(extraAmountOftoken1);
        return [
          amountToBalance.plus(extraAmountOftoken0).div(total),
          extraAmountOftoken1.div(total),
        ];
      }
    }
  }

  /**
   * For dual-token input: determines which token has excess relative to the CLM's deposit ratio
   * and how much of it to swap to the other token.
   *
   * Reuses `getDepositRatioData` to get the CLM's actual deposit split (accounting for
   * concentrated liquidity position, not just raw pool balances). We treat the combined user
   * input (converted to token1 terms) as a single token1 input to derive the target split.
   *
   * Inputs are in human-readable amounts (not wei).
   */
  public async getDualInputRebalanceData(
    inputAmount0: BigNumber,
    inputAmount1: BigNumber
  ): Promise<{
    swapFromTokenIndex: 0 | 1;
    swapAmount: BigNumber;
    needsSwap: boolean;
  }> {
    const strategyContract = fetchContract(
      this.strategy,
      BeefyCowcentratedLiquidityStrategyAbi,
      this.chain.id
    );
    const priceResult = await strategyContract.read.price();
    const price = new BigNumber(priceResult.toString(10));

    const input0Wei = toWei(inputAmount0, this.tokens[0].decimals);
    const input1Wei = toWei(inputAmount1, this.tokens[1].decimals);

    // Convert input0 to token1 terms using on-chain price
    const input0InToken1 = input0Wei.times(price).div(this.PRECISION);
    const totalInToken1 = input0InToken1.plus(input1Wei);

    if (totalInToken1.lte(BIG_ZERO)) {
      return { swapFromTokenIndex: 0, swapAmount: BIG_ZERO, needsSwap: false };
    }

    // Get the CLM's deposit split ratios by treating the combined value as a single token1 input.
    // getDepositRatioData returns [ratio0, ratio1] where these fractions sum to 1 and tell us
    // how to split the input into token0 and token1 for deposit.
    const fakeInput: InputTokenAmount = {
      token: this.tokens[1],
      amount: fromWei(totalInToken1, this.tokens[1].decimals),
      max: false,
    };
    // token1 input branch of getDepositRatioData doesn't use oracle prices
    const ratios = await this.getDepositRatioData(fakeInput, BIG_ONE, BIG_ONE);

    // Target amounts: ratios apply to the input (in token1 terms here).
    // ratios[0] portion goes to token0, ratios[1] portion stays as token1.
    const targetToken1Wei = totalInToken1.times(ratios[1]).integerValue(BigNumber.ROUND_FLOOR);
    const targetToken0InToken1 = totalInToken1.minus(targetToken1Wei);
    // Convert target token0 value back to token0 wei
    const targetToken0Wei =
      price.gt(BIG_ZERO) ?
        targetToken0InToken1.times(this.PRECISION).div(price).integerValue(BigNumber.ROUND_FLOOR)
      : BIG_ZERO;

    // Excess in token0 wei (positive = too much token0, negative = too little)
    const excess0Wei = input0Wei.minus(targetToken0Wei);

    // Threshold: skip swap if excess is tiny (< 0.1% of total value)
    const excess0InToken1 = excess0Wei.times(price).div(this.PRECISION);
    const threshold = totalInToken1.times(0.001);

    if (excess0InToken1.abs().lte(threshold)) {
      return { swapFromTokenIndex: 0, swapAmount: BIG_ZERO, needsSwap: false };
    }

    if (excess0Wei.gt(BIG_ZERO)) {
      // Too much token0, swap excess token0 → token1
      return {
        swapFromTokenIndex: 0,
        swapAmount: fromWei(excess0Wei, this.tokens[0].decimals),
        needsSwap: true,
      };
    } else {
      // Too much token1, swap the equivalent value from token1 → token0
      const swapAmountInToken1Wei = excess0InToken1.abs().integerValue(BigNumber.ROUND_FLOOR);
      return {
        swapFromTokenIndex: 1,
        swapAmount: fromWei(swapAmountInToken1Wei, this.tokens[1].decimals),
        needsSwap: true,
      };
    }
  }

  public async previewDeposit(inputAmount0: BigNumber, inputAmount1: BigNumber) {
    const input0 = toWei(inputAmount0, this.tokens[0].decimals);
    const input1 = toWei(inputAmount1, this.tokens[1].decimals);

    const clmContract = fetchContract(
      this.address,
      BeefyCowcentratedLiquidityVaultAbi,
      this.chain.id
    );

    const [previewDepositResult, isCalm, balancesResult, totalSupplyResult] = await Promise.all([
      clmContract.read.previewDeposit([bigNumberToBigInt(input0), bigNumberToBigInt(input1)]),
      clmContract.read.isCalm(),
      clmContract.read.balances(),
      clmContract.read.totalSupply(),
    ]);

    //bigint -> bigNumber
    const [liquidity, used0, used1] = [
      new BigNumber(previewDepositResult[0].toString(10)),
      new BigNumber(previewDepositResult[1].toString(10)),
      new BigNumber(previewDepositResult[2].toString(10)),
    ];
    const [balance0, balance1] = [
      new BigNumber(balancesResult[0].toString(10)),
      new BigNumber(balancesResult[1].toString(10)),
    ];
    const totalSupply = new BigNumber(totalSupplyResult.toString(10));

    const newTotalSupply = totalSupply.plus(liquidity);
    const newBalance0 = balance0.plus(used0);
    const newBalance1 = balance1.plus(used1);
    const ratio = liquidity.div(newTotalSupply);
    const position0 = newBalance0.times(ratio).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const position1 = newBalance1.times(ratio).decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const unused0 = input0.minus(used0);
    const unused1 = input1.minus(used1);

    return { liquidity, used0, used1, position0, position1, unused0, unused1, isCalm };
  }

  public async previewWithdraw(liquidity: BigNumber) {
    const clmContract = fetchContract(
      this.address,
      BeefyCowcentratedLiquidityVaultAbi,
      this.chain.id
    );
    const [withdrawResult, isCalm] = await Promise.all([
      clmContract.read.previewWithdraw([bigNumberToBigInt(toWei(liquidity, 18))]),
      clmContract.read.isCalm(),
    ]);

    return {
      amount0: new BigNumber(withdrawResult[0].toString(10)),
      amount1: new BigNumber(withdrawResult[1].toString(10)),
      isCalm,
    };
  }
}
