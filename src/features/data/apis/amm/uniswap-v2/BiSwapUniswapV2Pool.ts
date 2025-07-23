import type { MintFeeParams, PairData as BasePairData } from './UniswapV2Pool.ts';
import { UniswapV2Pool } from './UniswapV2Pool.ts';
import BigNumber from 'bignumber.js';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import type { SwapFeeParams } from '../types.ts';
import type { Abi } from 'viem';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';

type PairData = BasePairData & {
  devFee: BigNumber;
  swapFee: BigNumber;
};

const BiSwapPairAbi = [
  {
    constant: true,
    inputs: [],
    name: 'swapFee',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'devFee',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export class BiSwapUniswapV2Pool extends UniswapV2Pool {
  protected pairData: PairData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, BiSwapPairAbi, this.chain.id);
    const [_, devFee, swapFee] = await Promise.all([
      super.updatePairData(),
      contract.read.devFee(),
      contract.read.swapFee(),
    ]);
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    this.pairData.devFee = new BigNumber(devFee);
    this.pairData.swapFee = new BigNumber(swapFee);
  }

  protected getMintFeeParams(): MintFeeParams {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      feeOn: this.factoryData.feeTo !== ZERO_ADDRESS,
      numerator: new BigNumber(this.amm.mintFeeNumerator),
      denominator: this.pairData.devFee,
    };
  }

  protected getSwapFeeParams(): SwapFeeParams {
    if (!this.pairData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      numerator: this.pairData.swapFee,
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }
}
