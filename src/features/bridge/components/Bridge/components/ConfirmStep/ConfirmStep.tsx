import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormStep } from '../../../../../data/reducers/wallet/bridge';
import { Confirm } from '../Confirm/Confirm';
import { Step } from '../../../../../../components/Step';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import { useAppDispatch } from '../../../../../../store';

export const ConfirmStep = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(bridgeActions.setStep({ step: FormStep.Preview }));
  }, [dispatch]);

  return (
    <Step stepType="bridge" onBack={handleBack} title={t('Bridge-ConfirmStep-Title')}>
      <Confirm />
    </Step>
  );
};
