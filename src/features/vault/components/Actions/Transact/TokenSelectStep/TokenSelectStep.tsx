import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import { DepositTokenSelectList } from '../TokenSelectList/DepositTokenSelectList.tsx';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectTransactMode } from '../../../../../data/selectors/transact.ts';
import { WithdrawTokenSelectList } from '../TokenSelectList/WithdrawTokenSelectList.tsx';

export const TokenSelectStep = memo(function TokenSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const mode = useAppSelector(selectTransactMode);

  const handleBack = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.Form));
  }, [dispatch]);

  return (
    <div>
      <StepHeader onBack={handleBack}>{t('Transact-SelectToken')}</StepHeader>
      {mode === TransactMode.Deposit ? <DepositTokenSelectList /> : <WithdrawTokenSelectList />}
    </div>
  );
});
