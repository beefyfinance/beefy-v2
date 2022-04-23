import { BIG_ZERO } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

export const selectAllowanceByTokenId = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id'],
  spenderAddress: string
) => {
  return (
    state.user.allowance.byChainId[chainId]?.byTokenId[tokenId]?.bySpenderAddress[
      spenderAddress.toLowerCase()
    ] || BIG_ZERO
  );
};
