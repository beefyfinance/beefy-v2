import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperItems,
} from '../../../../features/data/selectors/stepper.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { Title } from '../Title/Title.tsx';
import { Message } from './common/Common.tsx';

export const StepsCountContent = memo(function StepsCountContent() {
  const { t } = useTranslation();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const currentStep = useAppSelector(selectStepperCurrentStep);
  const stepperItems = useAppSelector(selectStepperItems);

  return (
    <>
      <Title text={t('Transactn-Confirmed', { currentStep, totalTxs: stepperItems.length })} />
      <Message>{currentStepData?.message}</Message>
    </>
  );
});
