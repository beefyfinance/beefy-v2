import { BalancerFeature, type IBalancerAllPool, type IBalancerSinglePool } from '../types';
import type { ChainEntity } from '../../../../entities/chain';
import type { PoolConfig, VaultConfig } from '../vault/types';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import type { NormalizedWeightsResult } from './types';
import BigNumber from 'bignumber.js';
import { fromWei } from '../../../../../../helpers/big-number';
import { BalancerWeightedPoolAbi } from '../../../../../../config/abi/BalancerWeightedPoolAbi';
import { PoolExitKind, PoolJoinKind } from '../common/types';
import {
  poolExitKindToWeightedPoolExitKind,
  poolJoinKindToWeightedPoolJoinKind,
} from './join-exit-kinds';
import { SingleAllPool } from '../common/SingleAllPool';

const SUPPORTED_FEATURES = new Set<BalancerFeature>([
  BalancerFeature.AddRemoveAll,
  BalancerFeature.AddRemoveSingle,
  BalancerFeature.AddSlippage,
  BalancerFeature.RemoveSlippage,
]);

export class WeightedPool extends SingleAllPool implements IBalancerSinglePool, IBalancerAllPool {
  constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);

    this.getNormalizedWeights = this.cacheMethod(this.getNormalizedWeights);
  }

  supportsFeature(feature: BalancerFeature): boolean {
    return SUPPORTED_FEATURES.has(feature);
  }

  protected getJoinKindValue(kind: PoolJoinKind): number {
    const value = poolJoinKindToWeightedPoolJoinKind[kind];
    if (value === undefined) {
      throw new Error(`WeightedPool does not support join kind ${PoolJoinKind[kind]}`);
    }
    return value;
  }

  protected getExitKindValue(kind: PoolExitKind): number {
    const value = poolExitKindToWeightedPoolExitKind[kind];
    if (value === undefined) {
      throw new Error(`WeightedPool does not support join kind ${PoolExitKind[kind]}`);
    }
    return value;
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
