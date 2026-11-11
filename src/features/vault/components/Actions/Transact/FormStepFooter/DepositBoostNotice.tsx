import { memo, useCallback } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetWithBoost, transactSwitchMode } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectUserVaultBalanceInDepositToken } from '../../../../../data/selectors/balance.ts';
import type { UnifiedRewardToken } from '../../../../../data/selectors/rewards.ts';
import {
  selectTransactBoostAvailable,
  selectTransactIsLocked,
  selectTransactWithBoost,
} from '../../../../../data/selectors/transact.ts';
import { DepositTokensNotice } from './DepositTokensNotice.tsx';

export type BoostDepositNoticeProps = {
  vaultId: VaultEntity['id'];
  rewardTokens: UnifiedRewardToken[];
};

const BoostDepositNotice = memo(function BoostDepositNotice({
  vaultId,
  rewardTokens,
}: BoostDepositNoticeProps) {
  const dispatch = useAppDispatch();
  const available = useAppSelector(selectTransactBoostAvailable);
  const checked = useAppSelector(selectTransactWithBoost);
  const locked = useAppSelector(selectTransactIsLocked);
  const userDepositInVault = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );
  const deposited = userDepositInVault.gt(BIG_ZERO);

  const handleTab = useCallback(() => {
    dispatch(transactSwitchMode(TransactMode.Boost));
  }, [dispatch]);

  const handleToggle = useCallback(() => {
    dispatch(transactSetWithBoost(!checked));
  }, [dispatch, checked]);

  if (available) {
    return (
      <DepositTokensNotice
        i18nKey="Transact-Notice-Deposit-Boost-Deposited"
        rewardTokens={rewardTokens}
        onClick={handleToggle}
        checked={checked}
        disabled={locked}
      />
    );
  }

  return (
    <DepositTokensNotice
      i18nKey={
        deposited ? 'Transact-Notice-Deposit-Boost-Deposited' : 'Transact-Notice-Deposit-Boost'
      }
      rewardTokens={rewardTokens}
      onClick={handleTab}
    />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BoostDepositNotice;
