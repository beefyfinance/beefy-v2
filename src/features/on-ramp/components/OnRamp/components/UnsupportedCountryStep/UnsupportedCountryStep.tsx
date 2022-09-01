import React, { memo } from 'react';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { ErrorIndicator } from '../ErrorIndicator';

export const UnsupportedCountryStep = memo(function () {
  const { t } = useTranslation();

  return (
    <Step>
      <ErrorIndicator
        title={t('OnRamp-UnsupportedCountryStep-Title')}
        content={t('OnRamp-UnsupportedCountryStep-Content')}
      />
    </Step>
  );
});
