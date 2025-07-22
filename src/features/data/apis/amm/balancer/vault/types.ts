import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../../../entities/token.ts';
import type { ExitPoolUserData, JoinPoolUserData } from '../common/types.ts';
import type { Hex } from 'viem';
import type { Address } from 'viem';

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
  bptIndex?: number;
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
  sender: Address;
  /** bool */
  fromInternalBalance: boolean;
  /** address */
  recipient: Address;
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

export type JoinPoolRequest<TUserData = Hex> = {
  /** address[] */
  assets: string[];
  /** uint256[] */
  maxAmountsIn: BigNumber[];
  /** bytes */
  userData: TUserData;
  /** bool */
  fromInternalBalance: boolean;
};

export type JoinPoolArgs<TUserData = Hex> = {
  /** bytes32 */
  poolId: string;
  /** address */
  sender: string;
  /** address */
  recipient: string;
  /** tuple */
  request: JoinPoolRequest<TUserData>;
};

export type JoinPoolResult = {
  bptOut: string;
  amountsIn: string[];
};

export type ExitPoolRequest<TUserData = Hex> = {
  /** address[] */
  assets: string[];
  /** uint256[] */
  minAmountsOut: BigNumber[];
  /** bytes */
  userData: TUserData;
  /** bool */
  toInternalBalance: boolean;
};

export type ExitPoolArgs<TUserData = Hex> = {
  /** bytes32 */
  poolId: string;
  /** address */
  sender: string;
  /** address */
  recipient: string;
  /** tuple */
  request: ExitPoolRequest<TUserData>;
};

export type ExitPoolResult = {
  /** uint256 */
  bptIn: string;
  /** uint256[] */
  amountsOut: string[];
};

export type QueryBatchSwapRequest = Omit<QueryBatchSwapArgs, 'funds'>;
export type QueryBatchSwapResponse = BigNumber[];

export type QueryJoinPoolRequest = Omit<JoinPoolArgs<JoinPoolUserData>, 'sender' | 'recipient'>;
export type QueryJoinPoolResponse = {
  liquidity: BigNumber;
  usedInput: BigNumber[];
  unusedInput: BigNumber[];
};

export type QueryExitPoolRequest = Omit<ExitPoolArgs<ExitPoolUserData>, 'sender' | 'recipient'>;
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
  join: JoinPoolArgs<JoinPoolUserData>;
  insertBalance: boolean;
};

export type ExitPoolZapRequest = {
  exit: ExitPoolArgs<ExitPoolUserData>;
  poolAddress: string;
  insertBalance: boolean;
};
