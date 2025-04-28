import { memo, useCallback } from 'react';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { useAppDispatch } from '../../../../../../store.ts';
import { DepositTokensNotice } from './DepositTokensNotice.tsx';
import type { UnifiedRewardToken } from '../../../../../data/selectors/rewards.ts';

export type DepositClaimNoticeProps = {
  rewardTokens: UnifiedRewardToken[];
};

const DepositClaimNotice = memo(function DepositClaimNotice({
  rewardTokens,
}: DepositClaimNoticeProps) {
  const dispatch = useAppDispatch();
  const handleTab = useCallback(() => {
    dispatch(transactActions.switchMode(TransactMode.Claim));
  }, [dispatch]);
  return (
    <DepositTokensNotice
      i18nKey={'Transact-Notice-Deposit-Claim'}
      rewardTokens={rewardTokens}
      onClick={handleTab}
    />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default DepositClaimNotice;
