import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { ErrorIndicator } from '../ErrorIndicator/ErrorIndicator.tsx';

export const UnsupportedCountryStep = memo(function UnsupportedCountryStep() {
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
