import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { AllowanceTokenAmount } from '../apis/transact/transact-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isTokenErc20, type TokenEntity } from '../entities/token.ts';
import type { AllowanceState } from '../reducers/wallet/allowance-types.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';

const allowanceFrom = (
  byChainId: AllowanceState['byChainId'],
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address'],
  spenderAddress: string
) =>
  byChainId[chainId]?.byTokenAddress[tokenAddress.toLowerCase()]?.bySpenderAddress[
    spenderAddress.toLocaleLowerCase()
  ] || BIG_ZERO;

export const selectAllowanceByTokenAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address'],
  spenderAddress: string
) => allowanceFrom(state.user.allowance.byChainId, chainId, tokenAddress, spenderAddress);

export const selectPendingAllowances = createSelector(
  (state: BeefyState) => state.user.allowance.byChainId,
  (_state: BeefyState, allowances: AllowanceTokenAmount[]) => allowances,
  (byChainId, allowances): AllowanceTokenAmount[] =>
    arrayOrStaticEmpty(
      allowances.filter(a => {
        if (!isTokenErc20(a.token)) {
          return false;
        }
        return allowanceFrom(
          byChainId,
          a.token.chainId,
          a.token.address,
          a.spenderAddress
        ).isLessThan(a.amount);
      })
    )
);
