import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
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
