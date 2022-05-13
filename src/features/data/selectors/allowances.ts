import { BIG_ZERO } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

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
