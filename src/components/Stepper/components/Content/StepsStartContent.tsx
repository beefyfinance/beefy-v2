import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperItems,
} from '../../../../features/data/selectors/stepper.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { CircularProgress } from '../../../CircularProgress/CircularProgress.tsx';
import { Title } from '../Title/Title.tsx';
import { Message } from './common/Common.tsx';

export const StepsStartContent = memo(function StepsStartContent() {
  const { t } = useTranslation();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const currentStep = useAppSelector(selectStepperCurrentStep);
  const stepperItems = useAppSelector(selectStepperItems);

  return (
    <>
      <Title text={t('Transactn-Confirmed', { currentStep, totalTxs: stepperItems.length })} />
      <Message>
        {currentStepData ?
          <>
            <CircularProgress size={16} /> {t(`Stepper-${currentStepData.step}-Building-Content`)}
          </>
        : '...'}
      </Message>
    </>
  );
});
