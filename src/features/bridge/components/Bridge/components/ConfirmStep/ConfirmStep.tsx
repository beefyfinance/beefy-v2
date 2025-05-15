import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { FormStep } from '../../../../../data/reducers/wallet/bridge-types.ts';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge.ts';
import { Confirm } from '../Confirm/Confirm.tsx';

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
