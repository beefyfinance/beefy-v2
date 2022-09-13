import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormStep } from '../../../../../data/reducers/wallet/bridge';
import { Confirm } from '../Confirm/Confirm';
import { Step } from '../Step';

export const ConfirmStep = () => {
  const { t } = useTranslation();
  return (
    <Step backStep={FormStep.Preview} title={t('Bridge-ConfirmStep-Title')}>
      <Confirm />
    </Step>
  );
};
