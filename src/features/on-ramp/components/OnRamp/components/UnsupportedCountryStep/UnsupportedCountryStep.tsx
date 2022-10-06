import React, { memo } from 'react';

import { useTranslation } from 'react-i18next';
import { Step } from '../../../../../../components/Step';
import { ErrorIndicator } from '../ErrorIndicator';

export const UnsupportedCountryStep = memo(function () {
  const { t } = useTranslation();

  return (
    <Step stepType="onRamp">
      <ErrorIndicator
        title={t('OnRamp-UnsupportedCountryStep-Title')}
        content={t('OnRamp-UnsupportedCountryStep-Content')}
      />
    </Step>
  );
});
