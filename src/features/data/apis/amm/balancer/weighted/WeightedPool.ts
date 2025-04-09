import { BalancerFeature, type IBalancerAllPool, type IBalancerSinglePool } from '../types.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { PoolConfig, VaultConfig } from '../vault/types.ts';
import BigNumber from 'bignumber.js';
import { fromWei } from '../../../../../../helpers/big-number.ts';
import { BalancerWeightedPoolAbi } from '../../../../../../config/abi/BalancerWeightedPoolAbi.ts';
import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import {
  poolExitKindToWeightedPoolExitKind,
  poolJoinKindToWeightedPoolJoinKind,
} from './join-exit-kinds.ts';
import { SingleAllPool } from '../common/SingleAllPool.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';

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
    const pool = this.getPoolContract();
    const weights = await pool.read.getNormalizedWeights();
    return weights.map(weight => new BigNumber(weight.toString(10)));
  }

  protected getPoolContract() {
    return fetchContract(this.config.poolAddress, BalancerWeightedPoolAbi, this.chain.id);
  }
}
