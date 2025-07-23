import type { MintFeeParams, PairData as BasePairData } from './UniswapV2Pool.ts';
import { UniswapV2Pool } from './UniswapV2Pool.ts';
import BigNumber from 'bignumber.js';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi } from 'viem';

type PairData = BasePairData & {
  devFee: BigNumber;
};

const StellaPairAbi = [
  {
    inputs: [],
    name: 'devFee',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export class StellaUniswapV2Pool extends UniswapV2Pool {
  protected pairData: PairData | undefined = undefined;

  protected async updatePairData() {
    const contract = fetchContract(this.address, StellaPairAbi, this.chain.id);
    const [_, devFee] = await Promise.all([super.updatePairData(), contract.read.devFee()]);
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    this.pairData.devFee = new BigNumber(devFee);
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
}
