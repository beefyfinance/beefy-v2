import type { ChainEntity } from '../../../../entities/chain.ts';
import {
  type BatchSwapArgs,
  type ExitPoolArgs,
  type ExitPoolZapRequest,
  type FundManagement,
  type JoinPoolArgs,
  type JoinPoolZapRequest,
  type PoolConfig,
  type PoolTokensResponse,
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
} from './types.ts';
import { ZERO_ADDRESS } from '../../../../../../helpers/addresses.ts';
import BigNumber from 'bignumber.js';
import { BalancerVaultAbi } from '../../../../../../config/abi/BalancerVaultAbi.ts';
import { createCachedFactory, createFactory } from '../../../../utils/factory-utils.ts';
import { BalancerQueriesAbi } from '../../../../../../config/abi/BalancerQueriesAbi.ts';
import {
  bigNumberToBigInt,
  bigNumberToUint256String,
} from '../../../../../../helpers/big-number.ts';
import type { StepToken, ZapStep } from '../../../transact/zap/types.ts';
import { getInsertIndex } from '../../../transact/helpers/zap.ts';
import { getAddress, type Address, encodeFunctionData } from 'viem';
import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import { JoinExitEncoder } from '../common/JoinExitEncoder.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';

const queryFunds: FundManagement = {
  sender: ZERO_ADDRESS as Address,
  fromInternalBalance: false,
  recipient: ZERO_ADDRESS as Address,
  toInternalBalance: false,
};

export class Vault {
  constructor(
    protected readonly chain: ChainEntity,
    protected readonly config: VaultConfig
  ) {}

  async getPoolTokens(poolId: string): Promise<PoolTokensResponse> {
    const vault = await this.getVaultContract();
    const [tokens, balances] = await vault.read.getPoolTokens([poolId as Address]);

    if (
      !tokens ||
      !tokens.length ||
      !balances ||
      !balances.length ||
      tokens.length !== balances.length
    ) {
      throw new Error('Invalid result');
    }

    return tokens.map((token, i) => ({
      token: getAddress(token),
      balance: new BigNumber(balances[i].toString(10)),
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

    const simulationResult = await query.simulate.queryJoin([
      args.poolId as Address,
      args.sender as Address,
      args.recipient as Address,
      {
        assets: args.request.assets as Address[],
        maxAmountsIn: args.request.maxAmountsIn.map(bigNumberToBigInt),
        userData: args.request.userData,
        fromInternalBalance: args.request.fromInternalBalance,
      },
    ]);
    const [bptOut, amountsIn] = simulationResult.result;

    if (!amountsIn || !amountsIn.length || amountsIn.length !== request.request.assets.length) {
      throw new Error('Invalid result');
    }

    const usedInput = amountsIn.map(amount => new BigNumber(amount.toString(10)));

    return {
      liquidity: new BigNumber(bptOut.toString(10)),
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
        minAmountsOut: args.request.minAmountsOut.map(amount => amount.toString(10)),
        userData: args.request.userData,
        toInternalBalance: args.request.toInternalBalance,
      })
    );

    const simulationResult = await query.simulate.queryExit([
      args.poolId as Address,
      args.sender as Address,
      args.recipient as Address,
      {
        assets: args.request.assets as Address[],
        minAmountsOut: args.request.minAmountsOut.map(bigNumberToBigInt),
        userData: args.request.userData,
        toInternalBalance: args.request.toInternalBalance,
      },
    ]);

    if (!simulationResult?.result || simulationResult.result.length !== 2) {
      throw new Error('Invalid result');
    }

    const [bptIn, amountsOut] = simulationResult.result;

    return {
      liquidity: new BigNumber(bptIn.toString(10)),
      outputs: amountsOut.map(amount => new BigNumber(amount.toString(10))),
    };
  }

  async queryBatchSwap(request: QueryBatchSwapRequest): Promise<QueryBatchSwapResponse> {
    const vault = await this.getVaultContract();
    const args: QueryBatchSwapArgs = {
      ...request,
      funds: queryFunds,
    };

    const simulationResult = await vault.simulate.queryBatchSwap([
      args.kind,
      args.swaps.map(s => ({
        poolId: s.poolId as Address,
        assetInIndex: BigInt(s.assetInIndex),
        assetOutIndex: BigInt(s.assetOutIndex),
        amount: bigNumberToBigInt(s.amount),
        userData: s.userData as Address,
      })),
      args.assets as Address[],
      args.funds,
    ]);
    const result = simulationResult.result;

    if (result.length !== request.assets.length) {
      throw new Error('Invalid result');
    }

    return result.map(value => new BigNumber(value.toString(10)));
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
      tokens:
        request.insertBalance ?
          [{ token: request.swap.singleSwap.assetIn, index: amountInIndex }]
        : [],
    };
  }

  protected getVaultContract = createFactory(async () => {
    return fetchContract(this.config.vaultAddress, BalancerVaultAbi, this.chain.id);
  });

  protected getQueryContract = createFactory(async () => {
    return fetchContract(this.config.queryAddress, BalancerQueriesAbi, this.chain.id);
  });

  protected getVaultFunctionAbi = createCachedFactory(
    (name: string) => {
      const methodAbi = BalancerVaultAbi.find(abi => abi.type === 'function' && abi.name === name);
      if (!methodAbi) {
        throw new Error(`Function "${name}" not found in vault ABI`);
      }
      return methodAbi;
    },
    (name: string) => name
  );

  protected encodeJoinPool(args: JoinPoolArgs): string {
    const methodAbi = this.getVaultFunctionAbi('joinPool');

    return encodeFunctionData({
      abi: [methodAbi],
      args: [
        args.poolId as Address,
        args.sender as Address,
        args.recipient as Address,
        {
          assets: args.request.assets as Address[],
          maxAmountsIn: args.request.maxAmountsIn.map(bigNumberToBigInt),
          userData: args.request.userData,
          fromInternalBalance: args.request.fromInternalBalance,
        },
      ],
    });
  }

  protected encodeExitPool(args: ExitPoolArgs): string {
    const methodAbi = this.getVaultFunctionAbi('exitPool');

    return encodeFunctionData({
      abi: [methodAbi],
      args: [
        args.poolId as Address,
        args.sender as Address,
        args.recipient as Address,
        {
          assets: args.request.assets as Address[],
          minAmountsOut: args.request.minAmountsOut.map(bigNumberToBigInt),
          userData: args.request.userData,
          toInternalBalance: args.request.toInternalBalance,
        },
      ],
    });
  }

  protected encodeSwap(args: SwapArgs): string {
    const methodAbi = this.getVaultFunctionAbi('swap');

    return encodeFunctionData({
      abi: [methodAbi],
      args: [
        {
          poolId: args.singleSwap.poolId as Address,
          kind: args.singleSwap.kind,
          assetIn: args.singleSwap.assetIn as Address,
          assetOut: args.singleSwap.assetOut as Address,
          amount: bigNumberToBigInt(args.singleSwap.amount),
          userData: args.singleSwap.userData as Address,
        },
        {
          sender: args.funds.sender,
          fromInternalBalance: args.funds.fromInternalBalance,
          recipient: args.funds.recipient,
          toInternalBalance: args.funds.toInternalBalance,
        },
        bigNumberToBigInt(args.limit),
        BigInt(args.deadline),
      ],
    });
  }

  protected encodeBatchSwap(args: BatchSwapArgs): string {
    const methodAbi = this.getVaultFunctionAbi('batchSwap');

    return encodeFunctionData({
      abi: [methodAbi],
      args: [
        args.kind,
        args.swaps.map(
          swap =>
            ({
              poolId: swap.poolId as Address,
              assetInIndex: BigInt(swap.assetInIndex),
              assetOutIndex: BigInt(swap.assetOutIndex),
              amount: bigNumberToBigInt(swap.amount),
              userData: swap.userData as Address,
            }) as const
        ),
        args.assets as Address[],
        {
          sender: args.funds.sender,
          fromInternalBalance: args.funds.fromInternalBalance,
          recipient: args.funds.recipient,
          toInternalBalance: args.funds.toInternalBalance,
        } as const,
        args.limits.map(bigNumberToBigInt),
        BigInt(args.deadline),
      ],
    });
  }

  protected checkToken(pool: PoolConfig, token: string, label: string = 'token') {
    const index = pool.tokens.findIndex(t => t.address === token);
    if (index === -1) {
      throw new Error(`${label} must be a pool token`);
    }
  }
}
