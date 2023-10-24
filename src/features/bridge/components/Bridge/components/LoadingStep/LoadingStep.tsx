import React, { memo } from 'react';
import { LoadingStep as BaseLoadingStep } from '../../../../../../components/LoadingStep';

const _LoadingStep = () => {
  return <BaseLoadingStep stepType={'bridge'} />;
};

export const LoadingStep = memo(_LoadingStep);
