import { memo } from 'react';
import { LoadingStep as BaseLoadingStep } from '../../../../../../components/LoadingStep/LoadingStep.tsx';

const _LoadingStep = () => {
  return <BaseLoadingStep stepType={'bridge'} />;
};

export const LoadingStep = memo(_LoadingStep);
