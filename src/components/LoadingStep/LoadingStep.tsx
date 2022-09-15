import React, { memo } from 'react';
import { Step, StepType } from '../Step';
import { LoadingIndicator } from '../LoadingIndicator';

interface LoadingStepProps {
  stepType: StepType;
}

export const LoadingStep = memo<LoadingStepProps>(function ({ stepType }) {
  return (
    <Step stepType={stepType} title={null}>
      <LoadingIndicator />
    </Step>
  );
});
