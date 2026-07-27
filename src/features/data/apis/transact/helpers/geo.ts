import type { VaultEntity } from '../../../entities/vault.ts';
import {
  selectGeoBlockedTokenAndReceiptKeys,
  selectIsVaultGeoBlockedForUser,
  tokenKeyOf,
} from '../../../selectors/restrictions.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { DepositOption, WithdrawOption } from '../transact-types.ts';
import { isDirectVaultOption } from './options.ts';

/**
 * Removes options that swap a geo-restricted token in or out for the current user.
 * Direct vault options always survive so custody exit stays possible.
 */
export function filterGeoBlockedOptions<T extends DepositOption | WithdrawOption>(
  state: BeefyState,
  vault: VaultEntity,
  options: T[]
): T[] {
  const blocked = selectGeoBlockedTokenAndReceiptKeys(state);
  if (blocked.size === 0) {
    return options;
  }

  // every zap on a restricted vault trades its restricted deposit token(s);
  // also covers migrate enumeration, which fetches the destination vault's deposit options
  const allZapsBlocked = selectIsVaultGeoBlockedForUser(state, vault.id);

  return options.filter(option => {
    if (isDirectVaultOption(option)) {
      return true;
    }
    if (allZapsBlocked) {
      return false;
    }
    // cross-chain option tokens live on the src/dest chain, so key by token.chainId
    return !option.inputs
      .concat(option.wantedOutputs)
      .some(token => blocked.has(tokenKeyOf(token.chainId, token.address)));
  });
}
