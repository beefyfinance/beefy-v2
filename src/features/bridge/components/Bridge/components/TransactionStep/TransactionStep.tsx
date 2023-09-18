import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import { Step } from '../../../../../../components/Step';
import { useAppDispatch } from '../../../../../../store';
import { Transaction } from '../Transaction';

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
