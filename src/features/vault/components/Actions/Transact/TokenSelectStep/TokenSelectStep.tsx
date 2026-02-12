import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactMode,
  selectTransactVaultHasCrossChainZap,
} from '../../../../../data/selectors/transact.ts';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import { DepositTokenSelectList } from '../TokenSelectList/DepositTokenSelectList.tsx';
import { WithdrawTokenSelectList } from '../TokenSelectList/WithdrawTokenSelectList.tsx';

export const TokenSelectStep = memo(function TokenSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const mode = useAppSelector(selectTransactMode);
  const hasCrossChainZap = useAppSelector(selectTransactVaultHasCrossChainZap);
  const backStep =
    mode === TransactMode.Deposit && hasCrossChainZap ?
      TransactStep.ChainSelect
    : TransactStep.Form;

  const handleBack = useCallback(() => {
    dispatch(transactSwitchStep(backStep));
  }, [dispatch, backStep]);

  return (
    <div>
      <StepHeader onBack={handleBack}>{t('Transact-SelectToken')}</StepHeader>
      {mode === TransactMode.Deposit ?
        <DepositTokenSelectList />
      : <WithdrawTokenSelectList />}
    </div>
  );
});
