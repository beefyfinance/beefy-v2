import {
  type UserClmGroupPnl,
  type UserClmPnl,
  type UserVaultPnl,
} from '../../features/data/selectors/analytics-types.ts';

/** narrows a per-vault result; a group result is already known to be cowcentrated */
export function showClmPnlTooltip(userPnl: UserVaultPnl): userPnl is UserClmPnl;
export function showClmPnlTooltip(userPnl: UserClmGroupPnl): boolean;
export function showClmPnlTooltip(userPnl: UserVaultPnl | UserClmGroupPnl): boolean {
  if (userPnl.type === 'cowcentrated') {
    const { yields } = userPnl;
    return yields.claimed.sources.length > 0 || yields.pending.sources.length > 0;
  }
  return false;
}
