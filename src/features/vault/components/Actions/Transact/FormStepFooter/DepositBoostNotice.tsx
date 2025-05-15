import { memo, useCallback } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSwitchMode } from '../../../../../data/actions/transact.ts';
import type { PromoReward } from '../../../../../data/entities/promo.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectUserVaultBalanceInDepositToken } from '../../../../../data/selectors/balance.ts';
import { DepositTokensNotice } from './DepositTokensNotice.tsx';

export type BoostDepositNoticeProps = {
  vaultId: VaultEntity['id'];
  rewardTokens: PromoReward[];
};

const BoostDepositNotice = memo(function BoostDepositNotice({
  vaultId,
  rewardTokens,
}: BoostDepositNoticeProps) {
  const dispatch = useAppDispatch();
  const handleTab = useCallback(() => {
    dispatch(transactSwitchMode(TransactMode.Boost));
  }, [dispatch]);
  const userDepositInVault = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );
  const deposited = userDepositInVault.gt(BIG_ZERO);
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
