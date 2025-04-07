import type { ChainEntity } from '../../../../entities/chain.ts';
import type { PoolConfig, VaultConfig } from '../vault/types.ts';
import BigNumber from 'bignumber.js';
import { BalancerMetaStablePoolAbi } from '../../../../../../config/abi/BalancerMetaStablePoolAbi.ts';
import { BIG_ZERO, fromWei } from '../../../../../../helpers/big-number.ts';
import { FixedPoint } from '../common/FixedPoint.ts';
import { BalancerFeature, type IBalancerAllPool, type IBalancerSinglePool } from '../types.ts';
import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import {
  poolExitKindToMetaStablePoolExitKind,
  poolJoinKindToMetaStablePoolJoinKind,
} from './join-exit-kinds.ts';
import { SingleAllPool } from '../common/SingleAllPool.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';

const SUPPORTED_FEATURES = new Set<BalancerFeature>([
  BalancerFeature.AddRemoveAll,
  BalancerFeature.AddRemoveSingle,
  BalancerFeature.AddSlippage,
  BalancerFeature.RemoveSlippage,
]);

export class MetaStablePool extends SingleAllPool implements IBalancerSinglePool, IBalancerAllPool {
  constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);

    this.getScalingFactors = this.cacheMethod(this.getScalingFactors);
    this.getPoolContract = this.cacheMethod(this.getPoolContract);
  }

  supportsFeature(feature: BalancerFeature): boolean {
    return SUPPORTED_FEATURES.has(feature);
  }

  protected getJoinKindValue(kind: PoolJoinKind): number {
    const value = poolJoinKindToMetaStablePoolJoinKind[kind];
    if (value === undefined) {
      throw new Error(`MetaStablePool does not support join kind ${PoolJoinKind[kind]}`);
    }
    return value;
  }

  protected getExitKindValue(kind: PoolExitKind): number {
    const value = poolExitKindToMetaStablePoolExitKind[kind];
    if (value === undefined) {
      throw new Error(`MetaStablePool does not support join kind ${PoolExitKind[kind]}`);
    }
    return value;
  }

  /**
   * The ratio of balances[n] * scaling factor[n] * token rate[n] over their sum
   */
  async getSwapRatios(): Promise<BigNumber[]> {
    const upscaledBalances = await this.getUpscaledBalances();
    const totalUpscaledBalance = upscaledBalances.reduce((acc, b) => acc.plus(b), BIG_ZERO);
    const lastIndex = upscaledBalances.length - 1;
    const ratios = upscaledBalances.map((b, i) =>
      i === lastIndex ? BIG_ZERO : FixedPoint.divDown(b, totalUpscaledBalance)
    );
    ratios[lastIndex] = FixedPoint.ONE.minus(ratios.reduce((acc, w) => acc.plus(w), BIG_ZERO));
    return ratios.map(r => fromWei(r, 18));
  }

  /**
   * For meta stable pools, the scaling factors include the token rate too
   */
  protected async getScalingFactors() {
    const pool = this.getPoolContract();
    const factors = await pool.read.getScalingFactors();
    return factors.map(f => new BigNumber(f.toString(10)));
  }

  protected getPoolContract() {
    return fetchContract(this.config.poolAddress, BalancerMetaStablePoolAbi, this.chain.id);
  }
}
