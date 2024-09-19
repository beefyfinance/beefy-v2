import type { IBalancerJoinPool } from '../types';
import type { ChainEntity } from '../../../../entities/chain';
import type { PoolConfig, VaultConfig } from '../vault/types';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import type { NormalizedWeightsResult } from './types';
import BigNumber from 'bignumber.js';
import { fromWei } from '../../../../../../helpers/big-number';
import { BalancerWeightedPoolAbi } from '../../../../../../config/abi/BalancerWeightedPoolAbi';
import { JoinPool } from '../join/JoinPool';

export class WeightedPool extends JoinPool implements IBalancerJoinPool {
  constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);

    this.getNormalizedWeights = this.cacheMethod(this.getNormalizedWeights);
  }

  get joinSupportsSlippage() {
    return true;
  }

  async getSwapRatios(): Promise<BigNumber[]> {
    return (await this.getNormalizedWeights()).map(weight => fromWei(weight, 18));
  }

  protected async getNormalizedWeights(): Promise<BigNumber[]> {
    const pool = await this.getPoolContract();
    const weights: NormalizedWeightsResult = await pool.methods.getNormalizedWeights().call();
    return weights.map(weight => new BigNumber(weight));
  }

  protected async getPoolContract() {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(viemToWeb3Abi(BalancerWeightedPoolAbi), this.config.poolAddress);
  }
}
