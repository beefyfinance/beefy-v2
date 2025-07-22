import type { FactoryData as BaseFactoryData } from './UniswapV2Pool.ts';
import { UniswapV2Pool } from './UniswapV2Pool.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { Abi } from 'viem';

const DefiveFactoryAbi = [
  {
    inputs: [],
    name: 'feeToDevs',
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

export class DefiveUniswapV2Pool extends UniswapV2Pool {
  protected factoryData: BaseFactoryData | undefined = undefined;

  protected async updateFactoryData() {
    const contract = fetchContract(this.amm.factoryAddress, DefiveFactoryAbi, this.chain.id);
    const [feeTo] = await Promise.all([contract.read.feeToDevs()]);
    this.factoryData = {
      feeTo: feeTo || ZERO_ADDRESS,
    };
  }
}
