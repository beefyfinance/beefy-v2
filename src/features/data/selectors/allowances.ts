import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { AllowanceTokenAmount } from '../apis/transact/transact-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isTokenErc20, type TokenEntity } from '../entities/token.ts';
import type { BeefyState } from '../store/types.ts';

export const selectAllowanceByTokenAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address'],
  spenderAddress: string
) => {
  return (
    state.user.allowance.byChainId[chainId]?.byTokenAddress[tokenAddress.toLowerCase()]
      ?.bySpenderAddress[spenderAddress.toLocaleLowerCase()] || BIG_ZERO
  );
};

export const selectPendingAllowances = (
  state: BeefyState,
  allowances: AllowanceTokenAmount[]
): AllowanceTokenAmount[] => {
  return allowances.filter(a => {
    if (!isTokenErc20(a.token)) return false;
    const current = selectAllowanceByTokenAddress(
      state,
      a.token.chainId,
      a.token.address,
      a.spenderAddress
    );
    return current.isLessThan(a.amount);
  });
};
