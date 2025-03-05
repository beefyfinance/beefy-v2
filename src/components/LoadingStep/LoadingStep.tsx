import { memo } from 'react';
import type { StepType } from '../Step/Step.tsx';
import { Step } from '../Step/Step.tsx';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator.tsx';

interface LoadingStepProps {
  stepType: StepType;
}

export const LoadingStep = memo(function LoadingStep({ stepType }: LoadingStepProps) {
  return (
    <Step stepType={stepType} title={undefined}>
      <LoadingIndicator />
    </Step>
  );
});
