import type { IBalancerPool } from './types';
import type { ChainEntity } from '../../../entities/chain';
import BigNumber from 'bignumber.js';
import { getWeb3Instance } from '../../instances';
import { viemToWeb3Abi } from '../../../../../helpers/web3';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses';
import { BalancerVaultAbi } from '../../../../../config/abi/BalancerVaultAbi';
import { BIG_ZERO } from '../../../../../helpers/big-number';
import type { ZapStep } from '../../transact/zap/types';
import { getUnixNow } from '../../../../../helpers/date';
import abiCoder from 'web3-eth-abi';
import type { AbiItem } from 'web3-utils';
import { getInsertIndex } from '../../transact/helpers/zap';

export type BalancerComposableStablePoolConfig = {
  chain: ChainEntity;
  /** address */
  vaultAddress: string;
  /** address */
  poolAddress: string;
  /** bytes32 */
  poolId: string;
  /** address[] */
  tokens: string[];
};

enum SwapKind {
  GIVEN_IN = 0,
  GIVEN_OUT = 1,
}

type SingleSwap = {
  /** bytes32 */
  poolId: string;
  /** uint8 */
  kind: SwapKind;
  /** address */
  assetIn: string;
  /** address */
  assetOut: string;
  /** uint256 */
  amount: string;
  /** bytes */
  userData: string;
};

type BatchSwapStep = {
  /** bytes32 */
  poolId: string;
  /** uint256 */
  assetInIndex: number;
  /** uint256 */
  assetOutIndex: number;
  /** uint256 */
  amount: string;
  /** bytes */
  userData: string;
};

type FundManagement = {
  /** address */
  sender: string;
  /** bool */
  fromInternalBalance: boolean;
  /** address */
  recipient: string;
  /** bool */
  toInternalBalance: boolean;
};

type QueryBatchSwapArgs = {
  /** uint8 */
  kind: SwapKind;
  /** tuple[] */
  swaps: BatchSwapStep[];
  /** address[] */
  assets: string[];
  /** tuple */
  funds: FundManagement;
};

type SwapArgs = {
  /** tuple */
  singleSwap: SingleSwap;
  /** tuple */
  funds: FundManagement;
  /** uint256 */
  limit: string;
  /** uint256 */
  deadline: number;
};

type BatchSwapArgs = {
  /** uint8 */
  kind: SwapKind;
  /** tuple[] */
  swaps: BatchSwapStep[];
  /** address[] */
  assets: string[];
  /** tuple */
  funds: FundManagement;
  /** int256[] : +ve for tokens sent to the pool, -ve for tokens received from the pool */
  limits: string[];
  /** uint256 */
  deadline: number;
};

const queryFunds: FundManagement = {
  sender: ZERO_ADDRESS,
  fromInternalBalance: false,
  recipient: ZERO_ADDRESS,
  toInternalBalance: false,
};

const THIRTY_MINUTES_IN_SECONDS = 30 * 60;

export class BalancerComposableStablePool implements IBalancerPool {
  public readonly type = 'balancer';
  public readonly poolTokenIndex: number;

  constructor(protected readonly config: BalancerComposableStablePoolConfig) {
    this.poolTokenIndex = this.getTokenIndex(this.config.poolAddress);
  }

  async quoteAddLiquidityOneToken(tokenIn: string, amountIn: BigNumber): Promise<BigNumber> {
    this.checkToken(tokenIn, 'tokenIn');
    this.checkAmount(amountIn, 'amountIn');

    const args: QueryBatchSwapArgs = {
      kind: SwapKind.GIVEN_IN,
      swaps: [
        {
          poolId: this.config.poolId,
          assetInIndex: 0,
          assetOutIndex: 1,
          amount: amountIn.toString(10),
          userData: '0x',
        },
      ],
      assets: [tokenIn, this.config.poolAddress],
      funds: queryFunds,
    };

    const [vaultInputDelta, vaultOutputDelta] = await this.queryBatchSwap(args);

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

    const args: QueryBatchSwapArgs = {
      kind: SwapKind.GIVEN_IN,
      swaps: [
        {
          poolId: this.config.poolId,
          assetInIndex: 0,
          assetOutIndex: 1,
          amount: amountIn.toString(10),
          userData: '0x',
        },
      ],
      assets: [this.config.poolAddress, tokenOut],
      funds: queryFunds,
    };

    const [vaultInputDelta, vaultOutputDelta] = await this.queryBatchSwap(args);

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
    return this.getSwapZap(
      tokenIn,
      amountIn,
      this.config.poolAddress,
      amountOutMin,
      from,
      insertBalance,
      deadlineSeconds
    );
  }

  async getRemoveLiquidityOneTokenZap(
    amountIn: BigNumber,
    tokenOut: string,
    amountOutMin: BigNumber,
    from: string,
    insertBalance: boolean,
    deadlineSeconds: number = THIRTY_MINUTES_IN_SECONDS
  ): Promise<ZapStep> {
    return this.getSwapZap(
      this.config.poolAddress,
      amountIn,
      tokenOut,
      amountOutMin,
      from,
      insertBalance,
      deadlineSeconds
    );
  }

  protected async getSwapZap(
    tokenIn: string,
    amountIn: BigNumber,
    tokenOut: string,
    amountOutMin: BigNumber,
    from: string,
    insertBalance: boolean,
    deadlineSeconds: number = THIRTY_MINUTES_IN_SECONDS
  ): Promise<ZapStep> {
    this.checkToken(tokenIn, 'tokenIn');
    this.checkAmount(amountIn, 'amountIn');
    this.checkToken(tokenOut, 'tokenOut');
    this.checkAmount(amountOutMin, 'amountOutMin');

    const args: SwapArgs = {
      singleSwap: {
        poolId: this.config.poolId,
        kind: SwapKind.GIVEN_IN,
        assetIn: tokenIn,
        assetOut: tokenOut,
        amount: amountIn.toString(10),
        userData: '0x',
      },
      funds: {
        sender: from,
        fromInternalBalance: false,
        recipient: from,
        toInternalBalance: false,
      },
      limit: amountOutMin.toString(10),
      deadline: getUnixNow() + deadlineSeconds,
    };

    /*
     the byte offset at which amountIn is inserted in the calldata
     calculated using 32-byte words:
     00 : swap offset (07)
     valueAt(00) + 0 : singleSwap.poolId
     ..
     valueAt(00) + 4 : singleSwap.amount
     */
    const amountInIndex = getInsertIndex(7 + 4);

    return {
      target: this.config.vaultAddress,
      value: '0',
      data: this.encodeSwap(args),
      tokens: insertBalance ? [{ token: tokenIn, index: amountInIndex }] : [],
    };
  }

  protected encodeSwap(args: SwapArgs): string {
    const methodAbi = BalancerVaultAbi.find(abi => abi.type === 'function' && abi.name === 'swap');
    if (!methodAbi) {
      throw new Error('Method swap not found');
    }

    return abiCoder.encodeFunctionCall(methodAbi as AbiItem, [
      [
        args.singleSwap.poolId,
        args.singleSwap.kind,
        args.singleSwap.assetIn,
        args.singleSwap.assetOut,
        args.singleSwap.amount,
        args.singleSwap.userData,
      ],
      [
        args.funds.sender,
        args.funds.fromInternalBalance,
        args.funds.recipient,
        args.funds.toInternalBalance,
      ],
      args.limit,
      args.deadline,
    ]);
  }

  protected encodeBatchSwap(args: BatchSwapArgs): string {
    const methodAbi = BalancerVaultAbi.find(
      abi => abi.type === 'function' && abi.name === 'batchSwap'
    );
    if (!methodAbi) {
      throw new Error('Method batchSwap not found');
    }

    return abiCoder.encodeFunctionCall(methodAbi as AbiItem, [
      args.kind,
      args.swaps.map(swap => [
        swap.poolId,
        swap.assetInIndex,
        swap.assetOutIndex,
        swap.amount,
        swap.userData,
      ]),
      args.assets,
      [
        args.funds.sender,
        args.funds.fromInternalBalance,
        args.funds.recipient,
        args.funds.toInternalBalance,
      ],
      args.limits,
      args.deadline,
    ]);
  }

  protected async queryBatchSwap(args: QueryBatchSwapArgs): Promise<BigNumber[]> {
    const web3 = await getWeb3Instance(this.config.chain);
    const vault = new web3.eth.Contract(viemToWeb3Abi(BalancerVaultAbi), this.config.vaultAddress);

    const result: Array<string> | undefined = await vault.methods
      .queryBatchSwap(args.kind, args.swaps, args.assets, args.funds)
      .call();

    if (!result || !Array.isArray(result) || result.length !== args.assets.length) {
      throw new Error('Invalid result');
    }

    return result.map(value => new BigNumber(value));
  }

  protected getTokenIndex(address: string): number {
    const index = this.config.tokens.findIndex(token => token === address);
    if (index === -1) {
      throw new Error(`Address ${address} not found in tokens`);
    }
    return index;
  }

  protected checkAmount(amount: BigNumber, label: string = 'amount') {
    if (amount.lte(BIG_ZERO)) {
      throw new Error(`${label} must be greater than 0`);
    }

    if ((amount.decimalPlaces() || 0) > 0) {
      throw new Error(`${label} must be in wei`);
    }
  }

  protected checkToken(token: string, label: string = 'token') {
    const index = this.config.tokens.findIndex(t => t === token);
    if (index === -1) {
      throw new Error(`${label} must be a pool token`);
    }
  }
}
