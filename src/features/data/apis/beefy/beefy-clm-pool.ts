import { MultiCall, type ShapeWithLabel } from 'eth-multicall';
import type Web3 from 'web3';
import type { ChainEntity } from '../../entities/chain';
import { getWeb3Instance } from '../instances';
import { createContract, viemToWeb3Abi } from '../../../../helpers/web3';
import { BeefyCowcentratedLiquidityStrategyAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityStrategyAbi';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../config/abi/BeefyCowcentratedLiquidityVaultAbi';
import { BigNumber } from 'bignumber.js';
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

type PreviewWithdrawResponse = {
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
      this.address
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
          inputAmount0Wei.toString(10),
          inputamount1Wei.toString(10)
        ),
      },
    ];
    return calls;
  }

  protected getPreviewWithdrawRequests(liquidityAmountWei: BigNumber): ShapeWithLabel[] {
    const contract = createContract(
      viemToWeb3Abi(BeefyCowcentratedLiquidityVaultAbi),
      this.address
    );
    const calls: ShapeWithLabel[] = [
      {
        previewDeposit: contract.methods.previewWithdraw(liquidityAmountWei.toString(10)),
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
      used0: new BigNumber(result.previewDeposit[1]),
      used1: new BigNumber(result.previewDeposit[2]),
    };
  }

  protected consumePreviewWithdraw(untypedData: unknown[]) {
    const result = (untypedData as PreviewWithdrawResponse[])[0];
    return {
      amount0: new BigNumber(result.previewDeposit[0]),
      amount1: new BigNumber(result.previewDeposit[1]),
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
    const { balance0, balance1 } = this.consumeCLMData(clmResults);

    const bal0inToken1 = balance0.times(price).div(this.PRECISION);

    const balancingAmount: TokenAmount = balance1.gt(bal0inToken1)
      ? {
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

  public async previewDeposit(inputAmount0: BigNumber, inputAmount1: BigNumber) {
    const multicall = await this.getMulticall();
    const input0 = toWei(inputAmount0, this.tokens[0].decimals);
    const input1 = toWei(inputAmount1, this.tokens[1].decimals);
    const [previewDepositResponse, isCalmRequest, clmData] = await multicall.all([
      this.getPreviewDepositRequests(input0, input1),
      this.getIsCalmRequests(),
      this.getCLMDataRequests(),
    ]);
    const { liquidity, used0, used1 } = this.consumePreviewDeposit(previewDepositResponse);
    const { isCalm } = this.consumeIsCalm(isCalmRequest);
    const { balance0, balance1, totalSupply } = this.consumeCLMData(clmData);

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
    const multicall = await this.getMulticall();
    const [previewWithdrawResponse, isCalmRequest] = await multicall.all([
      this.getPreviewWithdrawRequests(toWei(liquidity, 18)),
      this.getIsCalmRequests(),
    ]);

    const previewResult = this.consumePreviewWithdraw(previewWithdrawResponse);
    const isCalmResult = this.consumeIsCalm(isCalmRequest);

    return {
      ...previewResult,
      ...isCalmResult,
    };
  }
}
