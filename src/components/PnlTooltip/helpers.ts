import {
  isUserClmPnl,
  type UserClmPnl,
  type UserVaultPnl,
} from '../../features/data/selectors/analytics-types.ts';

export function showClmPnlTooltip(userPnl: UserVaultPnl): userPnl is UserClmPnl {
  if (isUserClmPnl(userPnl)) {
    const { yields } = userPnl;
    return yields.claimed.sources.length > 0 || yields.pending.sources.length > 0;
  }
  return false;
}
