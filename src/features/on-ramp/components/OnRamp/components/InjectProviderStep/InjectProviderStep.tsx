import React, { memo, useCallback } from 'react';
import { Step } from '../../../../../../components/Step';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectSelectedQuote } from '../../../../../data/selectors/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { PROVIDERS } from '../../providers';
import { ProviderFrame } from './ProviderFrame';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';

export const InjectProviderStep = memo(function () {
  const quote = useAppSelector(selectSelectedQuote);
  const supported = quote.provider in PROVIDERS;

  if (supported) {
    return <Provider provider={quote.provider} />;
  }

  return <ProviderNotSupported provider={quote.provider} />;
});

const ProviderNotSupported = memo<{ provider: string }>(function ({ provider }) {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.InputAmount }));
  }, [dispatch]);

  return (
    <Step
      stepType="onRamp"
      title={t('OnRamp-InjectProviderStep-NotSupportedTitle')}
      onBack={handleBack}
    >
      <div>{provider} not supported</div>
    </Step>
  );
});

const Provider = memo<{ provider: string }>(function ({ provider }) {
  const { title } = PROVIDERS[provider];

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.InputAmount }));
  }, [dispatch]);

  return (
    <Step stepType="onRamp" title={title} onBack={handleBack} noPadding={true}>
      <ProviderFrame />
    </Step>
  );
});
