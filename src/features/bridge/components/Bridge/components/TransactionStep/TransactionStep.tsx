import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge.ts';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useAppDispatch } from '../../../../../../store.ts';
import { Transaction } from '../Transaction/Transaction.tsx';

export const TransactionStep = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(bridgeActions.restart());
  }, [dispatch]);

  return (
    <Step stepType="bridge" onBack={handleBack} title={t('Bridge-TransactionStep-Title')}>
      <Transaction />
    </Step>
  );
};
