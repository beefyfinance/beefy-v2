import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../../../entities/token';
import type { WeightedPoolExitKind } from '../weighted/types';

export type VaultConfig = {
  /** address */
  vaultAddress: string;
  /** address */
  queryAddress: string;
};

export type PoolConfig = {
  /** address */
  poolAddress: string;
  /** bytes32 */
  poolId: string;
  tokens: TokenEntity[];
};

export enum SwapKind {
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
  amount: BigNumber;
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
  amount: BigNumber;
  /** bytes */
  userData: string;
};

export type FundManagement = {
  /** address */
  sender: string;
  /** bool */
  fromInternalBalance: boolean;
  /** address */
  recipient: string;
  /** bool */
  toInternalBalance: boolean;
};

export type QueryBatchSwapArgs = {
  /** uint8 */
  kind: SwapKind;
  /** tuple[] */
  swaps: BatchSwapStep[];
  /** address[] */
  assets: string[];
  /** tuple */
  funds: FundManagement;
};

export type SwapArgs = {
  /** tuple */
  singleSwap: SingleSwap;
  /** tuple */
  funds: FundManagement;
  /** uint256 */
  limit: BigNumber;
  /** uint256 */
  deadline: number;
};

export type BatchSwapArgs = {
  /** uint8 */
  kind: SwapKind;
  /** tuple[] */
  swaps: BatchSwapStep[];
  /** address[] */
  assets: string[];
  /** tuple */
  funds: FundManagement;
  /** int256[] : +ve for tokens sent to the pool, -ve for tokens received from the pool */
  limits: BigNumber[];
  /** uint256 */
  deadline: number;
};

export type JoinPoolRequest = {
  /** address[] */
  assets: string[];
  /** uint256[] */
  maxAmountsIn: BigNumber[];
  /** bytes */
  userData: string;
  /** bool */
  fromInternalBalance: boolean;
};

export type JoinPoolArgs = {
  /** bytes32 */
  poolId: string;
  /** address */
  sender: string;
  /** address */
  recipient: string;
  /** tuple */
  request: JoinPoolRequest;
};

export type JoinPoolResult = {
  bptOut: string;
  amountsIn: string[];
};

export type ExitPoolRequest = {
  /** address[] */
  assets: string[];
  /** uint256[] */
  minAmountsOut: BigNumber[];
  /** bytes */
  userData: string;
  /** bool */
  toInternalBalance: boolean;
};

export type ExitPoolArgs = {
  /** bytes32 */
  poolId: string;
  /** address */
  sender: string;
  /** address */
  recipient: string;
  /** tuple */
  request: ExitPoolRequest;
};

export type ExitPoolResult = {
  /** uint256 */
  bptIn: string;
  /** uint256[] */
  amountsOut: string[];
};

export type AbiEncodeArgs = string | number | boolean | Array<AbiEncodeArgs>;

export type QueryBatchSwapRequest = Omit<QueryBatchSwapArgs, 'funds'>;
export type QueryBatchSwapResponse = BigNumber[];

export type QueryJoinPoolRequest = Omit<JoinPoolArgs, 'sender' | 'recipient'>;
export type QueryJoinPoolResponse = {
  liquidity: BigNumber;
  usedInput: BigNumber[];
  unusedInput: BigNumber[];
};

export type QueryExitPoolRequest = Omit<ExitPoolArgs, 'sender' | 'recipient'>;
export type QueryExitPoolResponse = {
  liquidity: BigNumber;
  outputs: BigNumber[];
};

export type SwapZapRequest = {
  swap: SwapArgs;
  insertBalance: boolean;
};

export type PoolTokensResult = {
  tokens: string[];
  balances: string[];
  lastChangeBlock: string;
};

export type PoolTokensResponse = Array<{ token: string; balance: BigNumber }>;

export type JoinPoolZapRequest = {
  join: JoinPoolArgs;
  insertBalance: boolean;
};

export type ExitPoolZapRequestKind =
  | {
      kind: WeightedPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT;
      token: string;
    }
  | {
      kind: WeightedPoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT;
      token: string;
      tokenIndex: number;
    }
  | {
      kind: WeightedPoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT;
      token: string;
    };

export type ExitPoolZapRequest = {
  exit: ExitPoolArgs;
  poolAddress: string;
  insertBalance: boolean;
};
