import { MultiCall, type ShapeWithLabel } from 'eth-multicall';
import type Web3 from 'web3';
import type { ChainEntity } from '../../entities/chain';
import { getWeb3Instance } from '../instances';
import { createContract, viemToWeb3Abi } from '../../../../helpers/web3';
import { BeefyCowcentratedLiquidityStrategyAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityStrategyAbi';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityVaultAbi';
import BigNumber from 'bignumber.js';
import { isTokenEqual, type TokenEntity } from '../../entities/token';
import type { InputTokenAmount, TokenAmount } from '../transact/transact-types';
import { BIG_ONE, BIG_ZERO, toWei } from '../../../../helpers/big-number';

type StrategyDataResponse = {
  price: string;
};
type IsCalmResponse = {
  isCalm: boolean;
};

type CLMDataResponse = {
  balances: Record<number, string>;
  totalSupply: string;
};

type PreviewDepositResponse = {
  previewDeposit: Record<number, string>;
};

export class BeefyCLMPool {
  public readonly type = 'uniswap-v2';

  protected web3: Web3 | undefined = undefined;
  protected multicall: MultiCall | undefined = undefined;
  protected readonly PRECISION = 1e36;

  constructor(
    protected address: string,
    protected strategy: string,
    protected chain: ChainEntity,
    protected tokens: TokenEntity[]
  ) {}

  async getWeb3(): Promise<Web3> {
    if (this.web3 === undefined) {
      this.web3 = await getWeb3Instance(this.chain);
    }

    return this.web3;
  }

  async getMulticall(): Promise<MultiCall> {
    if (this.multicall === undefined) {
      this.multicall = new MultiCall(await this.getWeb3(), this.chain.multicallAddress);
    }

    return this.multicall;
  }

  protected getStrategyDataRequests(): ShapeWithLabel[] {
    const contract = createContract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityStrategyAbi),
      this.strategy
    );
    return [
      {
        price: contract.methods.price(),
      },
    ];
  }

  protected getIsCalmRequests(): ShapeWithLabel[] {
    const contract = createContract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityStrategyAbi),
      this.strategy
    );
    return [
      {
        isCalm: contract.methods.isCalm(),
      },
    ];
  }

  protected getCLMDataRequests(): ShapeWithLabel[] {
    const contract = createContract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
      this.address
    );
    return [
      {
        balances: contract.methods.balances(),
        totalSupply: contract.methods.totalSupply(),
      },
    ];
  }

  protected getPreviewDepositRequests(
    inputAmount0Wei: BigNumber,
    inputamount1Wei: BigNumber
  ): ShapeWithLabel[] {
    const contract = createContract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
      this.address
    );
    const calls: ShapeWithLabel[] = [
      {
        previewDeposit: contract.methods.previewDeposit(
          inputAmount0Wei.toString(),
          inputamount1Wei.toString()
        ),
      },
    ];
    return calls;
  }

  protected consumeStrategyData(untypedData: unknown[]) {
    const result = (untypedData as StrategyDataResponse[])[0];
    return {
      price: new BigNumber(result.price),
    };
  }

  protected consumeIsCalm(untypedData: unknown[]) {
    const result = (untypedData as IsCalmResponse[])[0];
    return {
      isCalm: result.isCalm,
    };
  }

  protected consumeCLMData(untypedData: unknown[]) {
    const result = (untypedData as CLMDataResponse[])[0];
    return {
      balance0: new BigNumber(result.balances[0]),
      balance1: new BigNumber(result.balances[1]),
      totalSupply: new BigNumber(result.totalSupply),
    };
  }

  protected consumePreviewDeposit(untypedData: unknown[]) {
    const result = (untypedData as PreviewDepositResponse[])[0];
    return {
      liquidity: new BigNumber(result.previewDeposit[0]),
      amount0: new BigNumber(result.previewDeposit[1]),
      amount1: new BigNumber(result.previewDeposit[2]),
    };
  }

  public async getDepositRatioData(
    inputToken: InputTokenAmount,
    inputTokenPrice: BigNumber,
    token1Price: BigNumber
  ) {
    const multicall = await this.getMulticall();
    const [strategyResults, clmResults] = await multicall.all([
      this.getStrategyDataRequests(),
      this.getCLMDataRequests(),
    ]);

    const { price } = this.consumeStrategyData(strategyResults);
    const { balance0, balance1, totalSupply } = this.consumeCLMData(clmResults);

    console.log('Ratio data');
    console.log(`Price: ${price.toString()}`);
    console.log(`Balance0: ${balance0.toString()}`);
    console.log(`Balance1: ${balance1.toString()}`);
    console.log(`Total supply: ${totalSupply.toString()}`);

    const bal0inToken1 = balance0.times(price).div(this.PRECISION);
    console.log(`Balance0 in token1: ${bal0inToken1.toString()}`);

    const balancingAmount: TokenAmount = balance1.gt(bal0inToken1)
      ? {
          token: this.tokens[0],
          amount: balance1.minus(bal0inToken1).times(this.PRECISION).div(price),
        }
      : {
          token: this.tokens[1],
          amount: bal0inToken1.minus(balance1),
        };

    console.log(
      `Need to add ${balancingAmount.amount
        .shiftedBy(-balancingAmount.token.decimals)
        .toString()} of ${balancingAmount.token.symbol}`
    );

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
      console.log('Input token matches token1, will use clm price to calculate ratio');
      console.log(token1Price, ' token1Price', inputTokenPrice, ' inputTokenPrice');
      if (isTokenEqual(balancingAmount.token, inputToken.token)) {
        if (inputAmountInWei.lte(balancingAmount.amount)) {
          console.log('Input amount is not enough to balance, just input that');
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

    console.log('Using local prices to start off');

    // If the input token is a different token we estimate based on local prices and convert to token1
    const inputAmountInBalance1 = inputTokenPrice
      .shiftedBy(-inputToken.token.decimals)
      .times(inputAmountInWei)
      .div(token1Price.shiftedBy(-this.tokens[1].decimals));
    console.log(inputAmountInBalance1.toString(), 'inputAmountInBalance1');
    if (isTokenEqual(balancingAmount.token, this.tokens[1])) {
      if (inputAmountInBalance1.lte(balancingAmount.amount)) {
        console.log('Input amount is not enough to balance, just input that');
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

  public async previewDeposit(inputAmount0: BigNumber, inputAmount1: BigNumber) {
    const multicall = await this.getMulticall();
    const [previewDepositResponse, isCalmRequest] = await multicall.all([
      this.getPreviewDepositRequests(
        toWei(inputAmount0, this.tokens[0].decimals),
        toWei(inputAmount1, this.tokens[1].decimals)
      ),
      this.getIsCalmRequests(),
    ]);
    const { liquidity, amount0, amount1 } = this.consumePreviewDeposit(previewDepositResponse);
    const { isCalm } = this.consumeIsCalm(isCalmRequest);

    return { liquidity, amount0, amount1, isCalm };
  }
}
