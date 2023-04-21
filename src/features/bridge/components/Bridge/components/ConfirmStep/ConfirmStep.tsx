import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormStep, bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import { Confirm } from '../Confirm';
import { Step } from '../../../../../../components/Step';

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
