import type { AllowanceTokenAmount } from '../apis/transact/transact-types';
import type { ChainEntity } from '../entities/chain';
import { type TokenEntity } from '../entities/token';
import type { BeefyState } from '../store/types';
export declare const selectAllowanceByTokenAddress: (state: BeefyState, chainId: ChainEntity["id"], tokenAddress: TokenEntity["address"], spenderAddress: string) => BigNumber;
export declare const selectPendingAllowances: (state: BeefyState, allowances: AllowanceTokenAmount[]) => AllowanceTokenAmount[];
