import type { ChainEntity } from '../../../../entities/chain';
import {
  type AbiEncodeArgs,
  type BatchSwapArgs,
  type ExitPoolArgs,
  type ExitPoolResult,
  type ExitPoolZapRequest,
  type FundManagement,
  type JoinPoolArgs,
  type JoinPoolResult,
  type JoinPoolZapRequest,
  type PoolConfig,
  type PoolTokensResponse,
  type PoolTokensResult,
  type QueryBatchSwapArgs,
  type QueryBatchSwapRequest,
  type QueryBatchSwapResponse,
  type QueryExitPoolRequest,
  type QueryExitPoolResponse,
  type QueryJoinPoolRequest,
  type QueryJoinPoolResponse,
  type SwapArgs,
  type SwapZapRequest,
  type VaultConfig,
} from './types';
import { ZERO_ADDRESS } from '../../../../../../helpers/addresses';
import { BigNumber } from 'bignumber.js';
import { getWeb3Instance } from '../../../instances';
import { viemToWeb3Abi } from '../../../../../../helpers/web3';
import { BalancerVaultAbi } from '../../../../../../config/abi/BalancerVaultAbi';
import { createCachedFactory, createFactory } from '../../../../utils/factory-utils';
import { BalancerQueriesAbi } from '../../../../../../config/abi/BalancerQueriesAbi';
import abiCoder from 'web3-eth-abi';
import type { AbiItem } from 'web3-utils';
import {
  bigNumberToInt256String,
  bigNumberToUint256String,
} from '../../../../../../helpers/big-number';
import type { StepToken, ZapStep } from '../../../transact/zap/types';
import { getInsertIndex } from '../../../transact/helpers/zap';
import { getAddress } from 'viem';
import { PoolExitKind, PoolJoinKind } from '../common/types';
import { JoinExitEncoder } from '../common/JoinExitEncoder';

const queryFunds: FundManagement = {
  sender: ZERO_ADDRESS,
  fromInternalBalance: false,
  recipient: ZERO_ADDRESS,
  toInternalBalance: false,
};

export class Vault {
  constructor(protected readonly chain: ChainEntity, protected readonly config: VaultConfig) {}

  async getPoolTokens(poolId: string): Promise<PoolTokensResponse> {
    const vault = await this.getVaultContract();
    const result: PoolTokensResult = await vault.methods.getPoolTokens(poolId).call();

    if (
      !result?.tokens ||
      !Array.isArray(result.tokens) ||
      !result.balances ||
      !Array.isArray(result.balances) ||
      result.tokens.length !== result.balances.length
    ) {
      throw new Error('Invalid result');
    }

    return result.tokens.map((token, index) => ({
      token: getAddress(token),
      balance: new BigNumber(result.balances[index]),
    }));
  }

  async queryJoinPool(request: QueryJoinPoolRequest): Promise<QueryJoinPoolResponse> {
    const query = await this.getQueryContract();
    const args: JoinPoolArgs = {
      ...request,
      request: {
        ...request.request,
        userData: JoinExitEncoder.encodeJoin(request.request.userData),
      },
      sender: ZERO_ADDRESS,
      recipient: ZERO_ADDRESS,
    };

    console.debug('queryJoinPool', {
      poolId: args.poolId,
      sender: args.sender,
      recipient: args.recipient,
      request: JSON.stringify({
        assets: args.request.assets,
        maxAmountsIn: args.request.maxAmountsIn.map(bigNumberToUint256String),
        userData: args.request.userData,
        fromInternalBalance: args.request.fromInternalBalance,
      }),
    });

    const result: JoinPoolResult = await query.methods
      .queryJoin(args.poolId, args.sender, args.recipient, [
        args.request.assets,
        args.request.maxAmountsIn.map(bigNumberToUint256String),
        args.request.userData,
        args.request.fromInternalBalance,
      ])
      .call();

    if (
      !result ||
      !Array.isArray(result.amountsIn) ||
      result.amountsIn.length !== request.request.assets.length
    ) {
      throw new Error('Invalid result');
    }

    const usedInput = result.amountsIn.map(amount => new BigNumber(amount));

    return {
      liquidity: new BigNumber(result.bptOut),
      usedInput,
      unusedInput: request.request.maxAmountsIn.map((amount, index) =>
        amount.minus(usedInput[index])
      ),
    };
  }

  async queryExitPool(request: QueryExitPoolRequest): Promise<QueryExitPoolResponse> {
    const query = await this.getQueryContract();
    const args: ExitPoolArgs = {
      ...request,
      request: {
        ...request.request,
        userData: JoinExitEncoder.encodeExit(request.request.userData),
      },
      sender: ZERO_ADDRESS,
      recipient: ZERO_ADDRESS,
    };

    console.debug(this.config.queryAddress);
    console.debug(
      args.poolId,
      args.sender,
      args.recipient,
      JSON.stringify({
        assets: args.request.assets,
        minAmountsOut: args.request.minAmountsOut.map(bigNumberToUint256String),
        userData: args.request.userData,
        toInternalBalance: args.request.toInternalBalance,
      })
    );

    const result: ExitPoolResult = await query.methods
      .queryExit(args.poolId, args.sender, args.recipient, [
        args.request.assets,
        args.request.minAmountsOut.map(bigNumberToUint256String),
        args.request.userData,
        args.request.toInternalBalance,
      ])
      .call();

    if (
      !result ||
      !Array.isArray(result.amountsOut) ||
      result.amountsOut.length !== request.request.assets.length
    ) {
      throw new Error('Invalid result');
    }

    return {
      liquidity: new BigNumber(result.bptIn),
      outputs: result.amountsOut.map(amount => new BigNumber(amount)),
    };
  }

  async queryBatchSwap(request: QueryBatchSwapRequest): Promise<QueryBatchSwapResponse> {
    const vault = await this.getVaultContract();
    const args: QueryBatchSwapArgs = {
      ...request,
      funds: queryFunds,
    };

    const result: Array<string> | undefined = await vault.methods
      .queryBatchSwap(
        args.kind,
        args.swaps.map(s => ({
          ...s,
          amount: bigNumberToUint256String(s.amount),
        })),
        args.assets,
        args.funds
      )
      .call();

    if (!result || !Array.isArray(result) || result.length !== request.assets.length) {
      throw new Error('Invalid result');
    }

    return result.map(value => new BigNumber(value));
  }

  async getJoinPoolZap(request: JoinPoolZapRequest): Promise<ZapStep> {
    const args: JoinPoolArgs = {
      ...request.join,
      request: {
        ...request.join.request,
        userData: JoinExitEncoder.encodeJoin(request.join.request.userData),
      },
    };

    return {
      target: this.config.vaultAddress,
      value: '0',
      data: this.encodeJoinPool(args),
      tokens: this.getJoinPoolZapTokens(request),
    };
  }

  protected getJoinPoolZapTokens(request: JoinPoolZapRequest): StepToken[] {
    if (!request.insertBalance) {
      return [];
    }

    /* joinPool call data layout:
     * 00 | poolId
     * 01 | sender
     * 02 | recipient
     * 03 | offset to request
     * 04 | offset to request.assets
     * 05 | offset to request.maxAmountsIn
     * 06 | offset to request.userData
     * 07 | request.fromInternalBalance
     * 08 | length of request.assets
     * 09+0 | request.assets[0]
     * 09+n | request.assets[n]
     * 09+request.assets.length | length of maxAmountsIn
     * 09+request.assets.length+1+0 | maxAmountsIn[0]
     * 09+request.assets.length+1+n | maxAmountsIn[n]
     * 09+request.assets.length+1+request.maxAmountsIn.length | length of userData
     * 09+request.assets.length+1+request.maxAmountsIn.length+1+0 | word 0 of userData
     */

    // Always insert amounts into the maxAmountsIn array
    const maxAmountsInStartWord = 9 + request.join.request.assets.length + 1;
    const tokens: StepToken[] = request.join.request.assets.map((address, i) => ({
      token: address,
      index: getInsertIndex(maxAmountsInStartWord + i),
    }));

    // Maybe insert amountsIn into the userData bytes
    const userDataWordStart =
      9 + request.join.request.assets.length + 1 + request.join.request.maxAmountsIn.length + 1;

    const join = request.join.request.userData;
    switch (join.kind) {
      case PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT: {
        for (let i = 0; i < join.tokensIn.length; i++) {
          tokens.push({
            token: join.tokensIn[i],
            index: getInsertIndex(userDataWordStart + 4 + i), // 0 = JoinKind, 1 = Offset to amountsIn, 2 = minBPTAmountOut, 3 = amountsIn.length, 4 = amountsIn[0], 4+n = amountsIn[n]
          });
        }
        return tokens;
      }
      case PoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT: {
        // 0 = JoinKind, 1 = bptAmountOut, 2 = enterTokenIndex
        return tokens;
      }
      case PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT: {
        // 0 = JoinKind, 1 = bptAmountOut
        return tokens;
      }
      default: {
        throw new Error(`Unsupported join kind: ${join.kind}`);
      }
    }
  }

  async getExitPoolZap(request: ExitPoolZapRequest): Promise<ZapStep> {
    const args: ExitPoolArgs = {
      ...request.exit,
      request: {
        ...request.exit.request,
        userData: JoinExitEncoder.encodeExit(request.exit.request.userData),
      },
    };

    return {
      target: this.config.vaultAddress,
      value: '0',
      data: this.encodeExitPool(args),
      tokens: this.getExitPoolZapTokens(request),
    };
  }

  protected getExitPoolZapTokens(request: ExitPoolZapRequest): StepToken[] {
    if (!request.insertBalance) {
      return [];
    }

    /* exitPool call data layout:
     * 00 | poolId
     * 01 | sender
     * 02 | recipient
     * 03 | offset to request
     * 04 | offset to request.assets
     * 05 | offset to request.minAmountsOut
     * 06 | offset to request.userData
     * 07 | request.toInternal
     * 08 | length of request.assets
     * 09+0 | request.assets[0]
     * 09+n | request.assets[n]
     * 09+request.assets.length | length of minAmountsOut
     * 09+request.assets.length+1+0 | minAmountsOut[0]
     * 09+request.assets.length+1+n | minAmountsOut[n]
     * 09+request.assets.length+1+request.minAmountsOut.length | length of userData
     * 09+request.assets.length+1+request.minAmountsOut.length+1+0 | word 0 of userData
     */

    // Insert the amount of bpt to burn into the userData bytes
    const userDataWordStart =
      9 + request.exit.request.assets.length + 1 + request.exit.request.minAmountsOut.length + 1;

    const exit = request.exit.request.userData;
    switch (exit.kind) {
      case PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT: {
        return [
          {
            token: request.poolAddress,
            index: getInsertIndex(userDataWordStart + 1), // 0 = ExitKind, 1 = BPT amount
          },
        ];
      }
      case PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT: {
        return [
          {
            token: request.poolAddress,
            index: getInsertIndex(userDataWordStart + 1), // 0 = ExitKind, 1 = BPT amount, 2 = exitTokenIndex
          },
        ];
      }
      case PoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT: {
        return [
          {
            token: request.poolAddress,
            index: getInsertIndex(userDataWordStart + 2), // 0 = ExitKind, 1 = Offset to amountsOut, 2 = maxBPTAmountIn, 3 = amountsOut.length, 4 = amountsOut[0], 5 = amountsOut[1]
          },
        ];
      }
      default: {
        // @ts-expect-error - if all cases are handled
        throw new Error(`Unsupported exit kind: ${exit.kind}`);
      }
    }
  }

  async getSwapZap(request: SwapZapRequest): Promise<ZapStep> {
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
      data: this.encodeSwap(request.swap),
      tokens: request.insertBalance
        ? [{ token: request.swap.singleSwap.assetIn, index: amountInIndex }]
        : [],
    };
  }

  protected getWeb3 = createFactory(() => getWeb3Instance(this.chain));

  protected getVaultContract = createFactory(async () => {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(viemToWeb3Abi(BalancerVaultAbi), this.config.vaultAddress);
  });

  protected getQueryContract = createFactory(async () => {
    const web3 = await this.getWeb3();
    return new web3.eth.Contract(viemToWeb3Abi(BalancerQueriesAbi), this.config.queryAddress);
  });

  protected getVaultFunctionAbi = createCachedFactory(
    (name: string) => {
      const methodAbi = BalancerVaultAbi.find(abi => abi.type === 'function' && abi.name === name);
      if (!methodAbi) {
        throw new Error(`Function "${name}" not found in vault ABI`);
      }
      return methodAbi as AbiItem;
    },
    (name: string) => name
  );

  protected encodeJoinPool(args: JoinPoolArgs): string {
    const methodAbi = this.getVaultFunctionAbi('joinPool');

    return abiCoder.encodeFunctionCall(methodAbi, [
      args.poolId,
      args.sender,
      args.recipient,
      [
        args.request.assets,
        args.request.maxAmountsIn.map(bigNumberToUint256String),
        args.request.userData,
        args.request.fromInternalBalance,
      ],
    ] satisfies AbiEncodeArgs);
  }

  protected encodeExitPool(args: ExitPoolArgs): string {
    const methodAbi = this.getVaultFunctionAbi('exitPool');

    return abiCoder.encodeFunctionCall(methodAbi, [
      args.poolId,
      args.sender,
      args.recipient,
      [
        args.request.assets,
        args.request.minAmountsOut.map(bigNumberToUint256String),
        args.request.userData,
        args.request.toInternalBalance,
      ],
    ] satisfies AbiEncodeArgs);
  }

  protected encodeSwap(args: SwapArgs): string {
    const methodAbi = this.getVaultFunctionAbi('swap');

    return abiCoder.encodeFunctionCall(methodAbi, [
      [
        args.singleSwap.poolId,
        args.singleSwap.kind,
        args.singleSwap.assetIn,
        args.singleSwap.assetOut,
        bigNumberToUint256String(args.singleSwap.amount),
        args.singleSwap.userData,
      ],
      [
        args.funds.sender,
        args.funds.fromInternalBalance,
        args.funds.recipient,
        args.funds.toInternalBalance,
      ],
      bigNumberToUint256String(args.limit),
      args.deadline,
    ] satisfies AbiEncodeArgs);
  }

  protected encodeBatchSwap(args: BatchSwapArgs): string {
    const methodAbi = this.getVaultFunctionAbi('batchSwap');

    return abiCoder.encodeFunctionCall(methodAbi, [
      args.kind,
      args.swaps.map(swap => [
        swap.poolId,
        swap.assetInIndex,
        swap.assetOutIndex,
        bigNumberToUint256String(swap.amount),
        swap.userData,
      ]),
      args.assets,
      [
        args.funds.sender,
        args.funds.fromInternalBalance,
        args.funds.recipient,
        args.funds.toInternalBalance,
      ],
      args.limits.map(bigNumberToInt256String),
      args.deadline,
    ] satisfies AbiEncodeArgs);
  }

  protected checkToken(pool: PoolConfig, token: string, label: string = 'token') {
    const index = pool.tokens.findIndex(t => t.address === token);
    if (index === -1) {
      throw new Error(`${label} must be a pool token`);
    }
  }
}
