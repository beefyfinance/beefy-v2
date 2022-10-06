import React, { memo } from 'react';
import { Step } from '../Step';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { useTranslation } from 'react-i18next';

export const LoadingStep = memo(function () {
  const { t } = useTranslation();

  return (
    <Step title={null}>
      <LoadingIndicator text={t('OnRamp-Loading')} />
    </Step>
  );
});
