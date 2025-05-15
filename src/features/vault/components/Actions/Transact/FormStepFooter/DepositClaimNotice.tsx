import { memo, useCallback } from 'react';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { transactSwitchMode } from '../../../../../data/actions/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import type { UnifiedRewardToken } from '../../../../../data/selectors/rewards.ts';
import { DepositTokensNotice } from './DepositTokensNotice.tsx';

export type DepositClaimNoticeProps = {
  rewardTokens: UnifiedRewardToken[];
};

const DepositClaimNotice = memo(function DepositClaimNotice({
  rewardTokens,
}: DepositClaimNoticeProps) {
  const dispatch = useAppDispatch();
  const handleTab = useCallback(() => {
    dispatch(transactSwitchMode(TransactMode.Claim));
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
