import { memo } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectUserVaultBalanceInShareTokenPendingWithdrawal } from '../../../../../data/selectors/balance.ts';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { PendingWithdrawRequests } from './PendingWithdrawRequests.tsx';

export const WithdrawQueueLoader = memo(function WithdrawQueueLoader() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const pendingWithdrawBalance = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenPendingWithdrawal(state, vaultId)
  );

  if (pendingWithdrawBalance.lte(BIG_ZERO)) {
    return null;
  }

  return <PendingWithdrawRequests vaultId={vaultId} />;
});
