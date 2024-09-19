import type { ChainEntity } from '../../../../entities/chain';
import type { PoolConfig, VaultConfig } from '../vault/types';
import BigNumber from 'bignumber.js';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import { BalancerMetaStablePoolAbi } from '../../../../../../config/abi/BalancerMetaStablePoolAbi';
import { BIG_ZERO, fromWei } from '../../../../../../helpers/big-number';
import { FixedPoint } from '../join/FixedPoint';
import { JoinPool } from '../join/JoinPool';
import type { IBalancerJoinPool } from '../types';

export class MetaStablePool extends JoinPool implements IBalancerJoinPool {
  constructor(
    readonly chain: ChainEntity,
    readonly vaultConfig: VaultConfig,
    readonly config: PoolConfig
  ) {
    super(chain, vaultConfig, config);

    this.getScalingFactors = this.cacheMethod(this.getScalingFactors);
    this.getPoolContract = this.cacheMethod(this.getPoolContract);
  }

  get joinSupportsSlippage(): boolean {
    return true;
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
    const pool = await this.getPoolContract();
    const factors: string[] = await pool.methods.getScalingFactors().call();
    return factors.map(f => new BigNumber(f));
  }

  protected async getPoolContract() {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(viemToWeb3Abi(BalancerMetaStablePoolAbi), this.config.poolAddress);
  }
}
