import { type ComponentType, lazy, memo, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactFetchOptions } from '../../../../../data/actions/transact.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactMode,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { CowAnimationProvider } from '../../../../../../components/Button/AnimatedButton.tsx';
import { FormStepFooter } from '../FormStepFooter/FormStepFooter.tsx';

const DepositFormLoader = lazy(() => import('../DepositForm/DepositForm.tsx'));
const ClaimFormLoader = lazy(() => import('../ClaimForm/ClaimForm.tsx'));
const WithdrawFormLoader = lazy(() => import('../WithdrawForm/WithdrawForm.tsx'));
const BoostForm = lazy(() => import('../../Boosts/Boosts.tsx'));
const MigrateFormLoader = lazy(() => import('../MigrateForm/MigrateForm.tsx'));

const modeToComponent: Record<TransactMode, ComponentType> = {
  [TransactMode.Deposit]: DepositFormLoader,
  [TransactMode.Claim]: ClaimFormLoader,
  [TransactMode.Withdraw]: WithdrawFormLoader,
  [TransactMode.Boost]: BoostForm,
  [TransactMode.Migrate]: MigrateFormLoader,
};

export const FormStep = memo(function FormStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const vaultId = useAppSelector(selectTransactVaultId);
  const Component = modeToComponent[mode];

  useEffect(() => {
    // only dispatches if vaultId or mode changes
    dispatch(transactFetchOptions({ vaultId, mode }));
  }, [dispatch, mode, vaultId]);

  return (
    <Suspense fallback={<LoadingIndicator text={t('Transact-Loading')} height={468} />}>
      <CowAnimationProvider>
        <Component />
        <FormStepFooter />
      </CowAnimationProvider>
    </Suspense>
  );
});
