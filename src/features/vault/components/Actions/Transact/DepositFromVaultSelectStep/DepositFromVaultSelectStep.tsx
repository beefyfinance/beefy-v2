import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { DepositFromVaultSelectList } from '../DepositFromVaultSelectList/DepositFromVaultSelectList.tsx';
import { StepHeader } from '../StepHeader/StepHeader.tsx';

export const DepositFromVaultSelectStep = memo(function DepositFromVaultSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(transactSwitchStep(TransactStep.Form));
  }, [dispatch]);

  return (
    <div>
      <StepHeader onBack={handleBack}>{t('Transact-DepositFromVault-Title')}</StepHeader>
      <DepositFromVaultSelectList />
    </div>
  );
});
