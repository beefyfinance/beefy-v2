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
  ): Promise<[BigNumber, BigNumber]> {
    const { price, balancingAmount } = await this.fetchPoolState();
    const balancingIsToken0 = isTokenEqual(balancingAmount.token, this.tokens[0]);

    const inputAmountInWei = toWei(inputToken.amount, inputToken.token.decimals);
    const inputInBalancingWei = this.convertToBalancingDenomination(
      inputToken,
      inputAmountInWei,
      inputTokenPrice,
      token1Price,
      price,
      balancingIsToken0
    );

    return this.computeRatiosCore(inputInBalancingWei, balancingAmount.amount, balancingIsToken0);
  }

  /**
   * For dual-token input: determines which token has excess relative to the CLM's deposit ratio
   * and how much of it to swap to the other token.
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
    const { price, balancingAmount } = await this.fetchPoolState();
    const balancingIsToken0 = isTokenEqual(balancingAmount.token, this.tokens[0]);

    const input0Wei = toWei(inputAmount0, this.tokens[0].decimals);
    const input1Wei = toWei(inputAmount1, this.tokens[1].decimals);

    const input0InToken1 = input0Wei.times(price).div(this.PRECISION);
    const totalInToken1 = input0InToken1.plus(input1Wei);

    if (totalInToken1.lte(BIG_ZERO)) {
      return { swapFromTokenIndex: 0, swapAmount: BIG_ZERO, needsSwap: false };
    }

    const totalInBalancingWei =
      balancingIsToken0 ? totalInToken1.times(this.PRECISION).div(price) : totalInToken1;

    const ratios = this.computeRatiosCore(
      totalInBalancingWei,
      balancingAmount.amount,
      balancingIsToken0
    );

    const targetToken1Wei = totalInToken1.times(ratios[1]).integerValue(BigNumber.ROUND_FLOOR);
    const targetToken0InToken1 = totalInToken1.minus(targetToken1Wei);
    const targetToken0Wei =
      price.gt(BIG_ZERO) ?
        targetToken0InToken1.times(this.PRECISION).div(price).integerValue(BigNumber.ROUND_FLOOR)
      : BIG_ZERO;

    const excess0Wei = input0Wei.minus(targetToken0Wei);
    const excess0InToken1 = excess0Wei.times(price).div(this.PRECISION);
    // Skip swap if excess is tiny (< 0.1% of total value)
    const threshold = totalInToken1.times(0.001);

    if (excess0InToken1.abs().lte(threshold)) {
      return { swapFromTokenIndex: 0, swapAmount: BIG_ZERO, needsSwap: false };
    }

    if (excess0Wei.gt(BIG_ZERO)) {
      return {
        swapFromTokenIndex: 0,
        swapAmount: fromWei(excess0Wei, this.tokens[0].decimals),
        needsSwap: true,
      };
    } else {
      const swapAmountInToken1Wei = excess0InToken1.abs().integerValue(BigNumber.ROUND_FLOOR);
      return {
        swapFromTokenIndex: 1,
        swapAmount: fromWei(swapAmountInToken1Wei, this.tokens[1].decimals),
        needsSwap: true,
      };
    }
  }

  private async fetchPoolState(): Promise<{
    price: BigNumber;
    balance0: BigNumber;
    balance1: BigNumber;
    balancingAmount: TokenAmount;
  }> {
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

    const balance0 = new BigNumber(balanceResults[0].toString(10));
    const balance1 = new BigNumber(balanceResults[1].toString(10));
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

    return { price, balance0, balance1, balancingAmount };
  }

  private convertToBalancingDenomination(
    inputToken: InputTokenAmount,
    inputAmountInWei: BigNumber,
    inputTokenPrice: BigNumber,
    token1Price: BigNumber,
    price: BigNumber,
    balancingIsToken0: boolean
  ): BigNumber {
    if (isTokenEqual(inputToken.token, this.tokens[0])) {
      return balancingIsToken0 ? inputAmountInWei : (
          inputAmountInWei.times(price).div(this.PRECISION)
        );
    }
    if (isTokenEqual(inputToken.token, this.tokens[1])) {
      return balancingIsToken0 ?
          inputAmountInWei.times(this.PRECISION).div(price)
        : inputAmountInWei;
    }
    // Foreign token: use oracle prices to derive token1-wei value, convert to balancing side if needed
    const inputInToken1Wei = inputTokenPrice
      .shiftedBy(-inputToken.token.decimals)
      .times(inputAmountInWei)
      .div(token1Price.shiftedBy(-this.tokens[1].decimals));
    return balancingIsToken0 ? inputInToken1Wei.times(this.PRECISION).div(price) : inputInToken1Wei;
  }

  /**
   * Core deposit-ratio math, independent of I/O and input token.
   * Given an input value already expressed in the balancing token's wei, returns
   * [ratioToToken0, ratioToToken1] that sum to 1.
   *
   * The balancing side has a deficit the input helps fill, so up to `balancingAmount`
   * of the input sticks on that side; any excess is split 50/50.
   */
  private computeRatiosCore(
    inputInBalancingWei: BigNumber,
    balancingAmount: BigNumber,
    balancingIsToken0: boolean
  ): [BigNumber, BigNumber] {
    if (inputInBalancingWei.lte(balancingAmount)) {
      return balancingIsToken0 ? [BIG_ONE, BIG_ZERO] : [BIG_ZERO, BIG_ONE];
    }
    const remaining = inputInBalancingWei.minus(balancingAmount);
    const half = remaining.div(2);
    const total = balancingAmount.plus(half).plus(half);
    return balancingIsToken0 ?
        [balancingAmount.plus(half).div(total), half.div(total)]
      : [half.div(total), balancingAmount.plus(half).div(total)];
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
