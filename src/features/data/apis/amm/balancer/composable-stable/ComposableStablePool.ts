import type { IBalancerSwapPool } from '../types';
import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import type { ZapStep } from '../../../transact/zap/types';
import { createFactory } from '../../../../utils/factory-utils';
import { Vault } from '../vault/Vault';
import type { ChainEntity } from '../../../../entities/chain';
import {
  type PoolConfig,
  type QueryBatchSwapRequest,
  SwapKind,
  type VaultConfig,
} from '../vault/types';
import { getUnixNow } from '../../../../../../helpers/date';

const THIRTY_MINUTES_IN_SECONDS = 30 * 60;

export class ComposableStablePool implements IBalancerSwapPool {
  public readonly type = 'balancer';
  public readonly subType = 'swap';

  constructor(
    protected readonly chain: ChainEntity,
    protected readonly vaultConfig: VaultConfig,
    protected readonly config: PoolConfig
  ) {
    this.checkToken(this.config.poolAddress, 'poolAddress');
  }

  async quoteAddLiquidityOneToken(tokenIn: string, amountIn: BigNumber): Promise<BigNumber> {
    this.checkToken(tokenIn, 'tokenIn');
    this.checkAmount(amountIn, 'amountIn');

    const request: QueryBatchSwapRequest = {
      kind: SwapKind.GIVEN_IN,
      swaps: [
        {
          poolId: this.config.poolId,
          assetInIndex: 0,
          assetOutIndex: 1,
          amount: amountIn,
          userData: '0x',
        },
      ],
      assets: [tokenIn, this.config.poolAddress],
    };

    const vault = this.getVault();
    const [vaultInputDelta, vaultOutputDelta] = await vault.queryBatchSwap(request);

    if (!vaultInputDelta.eq(amountIn)) {
      throw new Error('Not all input used');
    }

    if (vaultOutputDelta.gte(BIG_ZERO)) {
      throw new Error('Output is negative');
    }

    return vaultOutputDelta.abs();
  }

  async quoteRemoveLiquidityOneToken(amountIn: BigNumber, tokenOut: string): Promise<BigNumber> {
    this.checkAmount(amountIn, 'amountIn');
    this.checkToken(tokenOut, 'tokenOut');

    const request: QueryBatchSwapRequest = {
      kind: SwapKind.GIVEN_IN,
      swaps: [
        {
          poolId: this.config.poolId,
          assetInIndex: 0,
          assetOutIndex: 1,
          amount: amountIn,
          userData: '0x',
        },
      ],
      assets: [this.config.poolAddress, tokenOut],
    };

    const vault = this.getVault();
    const [vaultInputDelta, vaultOutputDelta] = await vault.queryBatchSwap(request);

    if (!vaultInputDelta.eq(amountIn)) {
      throw new Error('Not all input used');
    }

    if (vaultOutputDelta.gte(BIG_ZERO)) {
      throw new Error('Output is negative');
    }

    return vaultOutputDelta.abs();
  }

  async getAddLiquidityOneTokenZap(
    tokenIn: string,
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    from: string,
    insertBalance: boolean,
    deadlineSeconds: number = THIRTY_MINUTES_IN_SECONDS
  ): Promise<ZapStep> {
    this.checkToken(tokenIn, 'tokenIn');
    this.checkAmount(amountIn, 'amountIn');
    this.checkAmount(amountOutMin, 'amountOutMin');

    const vault = this.getVault();
    return vault.getSwapZap({
      swap: {
        singleSwap: {
          poolId: this.config.poolId,
          kind: SwapKind.GIVEN_IN,
          assetIn: tokenIn,
          assetOut: this.config.poolAddress,
          amount: amountIn,
          userData: '0x',
        },
        funds: {
          sender: from,
          fromInternalBalance: false,
          recipient: from,
          toInternalBalance: false,
        },
        limit: amountOutMin,
        deadline: getUnixNow() + deadlineSeconds,
      },
      insertBalance,
    });
  }

  async getRemoveLiquidityOneTokenZap(
    amountIn: BigNumber,
    tokenOut: string,
    amountOutMin: BigNumber,
    from: string,
    insertBalance: boolean,
    deadlineSeconds: number = THIRTY_MINUTES_IN_SECONDS
  ): Promise<ZapStep> {
    this.checkToken(tokenOut, 'tokenOut');
    this.checkAmount(amountIn, 'amountIn');
    this.checkAmount(amountOutMin, 'amountOutMin');

    const vault = this.getVault();
    return vault.getSwapZap({
      swap: {
        singleSwap: {
          poolId: this.config.poolId,
          kind: SwapKind.GIVEN_IN,
          assetIn: this.config.poolAddress,
          assetOut: tokenOut,
          amount: amountIn,
          userData: '0x',
        },
        funds: {
          sender: from,
          fromInternalBalance: false,
          recipient: from,
          toInternalBalance: false,
        },
        limit: amountOutMin,
        deadline: getUnixNow() + deadlineSeconds,
      },
      insertBalance,
    });
  }

  protected getVault = createFactory(() => {
    return new Vault(this.chain, this.vaultConfig);
  });

  protected checkAmount(amount: BigNumber, label: string = 'amount') {
    if (amount.lte(BIG_ZERO)) {
      throw new Error(`${label} must be greater than 0`);
    }

    if ((amount.decimalPlaces() || 0) > 0) {
      throw new Error(`${label} must be in wei`);
    }
  }

  protected checkToken(tokenAddress: string, label: string = 'token') {
    const index = this.config.tokens.findIndex(t => t.address === tokenAddress);
    if (index === -1) {
      throw new Error(`${label} must be a pool token`);
    }
  }
}
