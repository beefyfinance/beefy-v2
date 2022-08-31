import React, { memo } from 'react';
import { Step } from '../Step';
import { LoadingIndicator } from '../LoadingIndicator';

export const LoadingStep = memo(function () {
  return (
    <Step title={null}>
      <LoadingIndicator />
    </Step>
  );
});
