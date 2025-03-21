import { type ComponentType, lazy, memo, Suspense, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectTransactMode,
  selectTransactShouldShowBoost,
  selectTransactShouldShowBoostNotification,
  selectTransactShouldShowClaims,
  selectTransactShouldShowClaimsNotification,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { CardHeaderTabs } from '../../../Card/CardHeaderTabs.tsx';
import { transactFetchOptions } from '../../../../../data/actions/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';

const DepositFormLoader = lazy(() => import('../DepositForm/DepositForm.tsx'));
const ClaimFormLoader = lazy(() => import('../ClaimForm/ClaimForm.tsx'));
const WithdrawFormLoader = lazy(() => import('../WithdrawForm/WithdrawForm.tsx'));
const BoostFormLoader = lazy(() => import('../BoostForm/BoostForm.tsx'));

const modeToComponent: Record<TransactMode, ComponentType> = {
  [TransactMode.Deposit]: DepositFormLoader,
  [TransactMode.Claim]: ClaimFormLoader,
  [TransactMode.Withdraw]: WithdrawFormLoader,
  [TransactMode.Boost]: BoostFormLoader,
};

export const FormStep = memo(function FormStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const vaultId = useAppSelector(selectTransactVaultId);
  const showClaim = useAppSelector(state => selectTransactShouldShowClaims(state, vaultId));
  const showBoost = useAppSelector(state => selectTransactShouldShowBoost(state, vaultId));
  const highlightClaim = useAppSelector(state =>
    selectTransactShouldShowClaimsNotification(state, vaultId)
  );
  const highlightBoost = useAppSelector(state =>
    selectTransactShouldShowBoostNotification(state, vaultId)
  );
  const Component = modeToComponent[mode];
  const handleModeChange = useCallback(
    (newMode: string) => {
      dispatch(transactActions.switchMode(parseInt(newMode)));
    },
    [dispatch]
  );
  const modeOptions = useMemo(
    () => [
      { value: TransactMode.Deposit.toString(), label: t('Transact-Deposit') },
      ...(showClaim ? [{ value: TransactMode.Claim.toString(), label: t('Transact-Claim') }] : []),
      ...(showBoost ? [{ value: TransactMode.Boost.toString(), label: t('Transact-Boost') }] : []),
      { value: TransactMode.Withdraw.toString(), label: t('Transact-Withdraw') },
    ],
    [t, showClaim, showBoost]
  );

  const highlight = useMemo(() => {
    return highlightBoost
      ? TransactMode.Boost.toString()
      : highlightClaim
        ? TransactMode.Claim.toString()
        : undefined;
  }, [highlightBoost, highlightClaim]);

  useEffect(() => {
    // only dispatches if vaultId or mode changes
    dispatch(transactFetchOptions({ vaultId, mode }));
  }, [dispatch, mode, vaultId]);

  return (
    <div>
      <CardHeaderTabs
        selected={mode.toString()}
        options={modeOptions}
        onChange={handleModeChange}
        highlight={highlight}
      />
      <Suspense fallback={<LoadingIndicator text={t('Transact-Loading')} />}>
        <Component />
      </Suspense>
    </div>
  );
});
