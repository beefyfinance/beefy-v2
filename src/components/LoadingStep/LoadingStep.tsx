import React, { memo } from 'react';
import type { StepType } from '../Step';
import { Step } from '../Step';
import { LoadingIndicator } from '../LoadingIndicator';

interface LoadingStepProps {
  stepType: StepType;
}

export const LoadingStep = memo<LoadingStepProps>(function LoadingStep({ stepType }) {
  return (
    <Step stepType={stepType} title={null}>
      <LoadingIndicator />
    </Step>
  );
});
