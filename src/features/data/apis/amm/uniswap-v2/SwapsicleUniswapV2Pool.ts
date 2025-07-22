import type {
  FactoryData as BaseFactoryData,
  FactoryDataResponse as BaseFactoryDataResponse,
  MintFeeResult,
} from './UniswapV2Pool.ts';
import { UniswapV2Pool } from './UniswapV2Pool.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi } from 'viem';

export type FactoryDataResponse = BaseFactoryDataResponse & {
  feeToStake: string;
};

export type FactoryData = BaseFactoryData & {
  feeToStake: string;
};

const SwapsicleFactoryAbi = [
  {
    inputs: [],
    name: 'feeToStake',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export class SwapsicleUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: FactoryData | undefined = undefined;

  protected async updateFactoryData() {
    const contract = fetchContract(this.amm.factoryAddress, SwapsicleFactoryAbi, this.chain.id);
    const [_, feeToStake] = await Promise.all([
      super.updateFactoryData(),
      contract.read.feeToStake(),
    ]);
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }
    this.factoryData.feeToStake = feeToStake;
  }

  protected getMintFee(): MintFeeResult {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    const { feeOn, numerator: feeNumerator, denominator: feeDenominator } = this.getMintFeeParams();
    const { kLast, totalSupply, reserves0, reserves1 } = this.pairData;
    const feeOnStake = this.factoryData.feeToStake !== ZERO_ADDRESS;

    if (
      !feeOn ||
      kLast.isZero() ||
      reserves0.isZero() ||
      reserves1.isZero() ||
      totalSupply.isZero()
    ) {
      return {
        feeOn,
        liquidityMinted: BIG_ZERO,
        newTotalSupply: totalSupply,
      };
    }

    // Normal mint fee calculation
    const rootK = reserves0
      .multipliedBy(reserves1)
      .squareRoot()
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const rootKLast = kLast.squareRoot().decimalPlaces(0, BigNumber.ROUND_FLOOR);
    if (rootK <= rootKLast) {
      return {
        feeOn,
        liquidityMinted: BIG_ZERO,
        newTotalSupply: totalSupply,
      };
    }

    const numerator = totalSupply.multipliedBy(rootK.minus(rootKLast)).multipliedBy(feeNumerator);
    let denominator = rootK
      .multipliedBy(feeDenominator)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR) // Swapsicle has rooK*17/3
      .plus(rootKLast.multipliedBy(feeNumerator));
    const mintFeeLiquidity = numerator.dividedToIntegerBy(denominator);

    // Additional stake fee calculation
    let stakeFeeLiquidity = BIG_ZERO;
    if (feeOnStake) {
      denominator = rootK.multipliedBy(349).dividedToIntegerBy(51).plus(rootKLast);
      stakeFeeLiquidity = numerator.dividedToIntegerBy(denominator);
    }

    const liquidityMinted = mintFeeLiquidity.plus(stakeFeeLiquidity);

    return {
      feeOn,
      liquidityMinted,
      newTotalSupply: totalSupply.plus(liquidityMinted),
    };
  }
}
