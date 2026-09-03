import { memo, useCallback } from 'react';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  transactSetStakeIntoBoost,
  transactSwitchMode,
} from '../../../../../data/actions/transact.ts';
import type { PromoReward } from '../../../../../data/entities/promo.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectUserVaultBalanceInDepositToken } from '../../../../../data/selectors/balance.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactBoostForStaking,
  selectTransactExecuting,
  selectTransactStakeIntoBoost,
  selectTransactStakeIntoBoostSupported,
} from '../../../../../data/selectors/transact.ts';
import { DepositTokensNotice } from './DepositTokensNotice.tsx';

export type BoostDepositNoticeProps = {
  vaultId: VaultEntity['id'];
  rewardTokens: PromoReward[];
};

/**
 * When the deposit can stake into the boost in the same transaction the strip becomes the opt-in
 * control for it; otherwise it stays a link across to the boost tab.
 */
const BoostDepositNotice = memo(function BoostDepositNotice({
  vaultId,
  rewardTokens,
}: BoostDepositNoticeProps) {
  const dispatch = useAppDispatch();
  const stakeable = useAppSelector(selectTransactBoostForStaking);
  const supported = useAppSelector(selectTransactStakeIntoBoostSupported);
  const checked = useAppSelector(selectTransactStakeIntoBoost);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const isStepping = useAppSelector(selectIsStepperStepping);
  const userDepositInVault = useAppSelector(state =>
    selectUserVaultBalanceInDepositToken(state, vaultId)
  );
  const deposited = userDepositInVault.gt(BIG_ZERO);

  const handleTab = useCallback(() => {
    dispatch(transactSwitchMode(TransactMode.Boost));
  }, [dispatch]);

  const handleToggle = useCallback(() => {
    dispatch(transactSetStakeIntoBoost(!checked));
  }, [dispatch, checked]);

  if (stakeable && supported) {
    return (
      <DepositTokensNotice
        // reads correctly whether or not they already hold a position
        i18nKey="Transact-Notice-Deposit-Boost-Deposited"
        rewardTokens={rewardTokens}
        onClick={handleToggle}
        checked={checked}
        disabled={isExecuting || isStepping}
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
