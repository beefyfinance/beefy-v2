import type { AllowanceTokenAmount } from '../apis/transact/transact-types.ts';
import { selectPendingAllowances } from '../selectors/allowances.ts';
import { selectIsWalletConnected } from '../selectors/wallet.ts';
import { useAppSelector } from '../store/hooks.ts';
import { featureFlag_disableExactApprovals } from '../utils/feature-flags.ts';

/** Whether to offer the exact / unlimited approval choice for these allowances */
export function useNeedsApproval(allowances: AllowanceTokenAmount[]): boolean {
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const pendingCount = useAppSelector(state => selectPendingAllowances(state, allowances).length);
  return isWalletConnected && pendingCount > 0 && !featureFlag_disableExactApprovals();
}
