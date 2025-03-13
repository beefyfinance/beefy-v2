import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge.ts';
import { Confirm } from '../Confirm/Confirm.tsx';
import { Step } from '../../../../../../components/Step/Step.tsx';

import { useAppDispatch } from '../../../../../../store.ts';

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
