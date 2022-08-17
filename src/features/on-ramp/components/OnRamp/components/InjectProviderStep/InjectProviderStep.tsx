import React, { memo } from 'react';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { selectSelectedQuote } from '../../../../../data/selectors/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { useAsync } from '../../../../../../helpers/useAsync';
import { PROVIDERS } from '../../providers';
import { LoadingIndicator } from '../LoadingIndicator';

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
  return (
    <Step title={t('OnRamp-InjectProviderStep-NotSupportedTitle')} backStep={FormStep.InputAmount}>
      <div>{provider} not supported</div>
    </Step>
  );
});

const Provider = memo<{ provider: string }>(function ({ provider }) {
  const { title, loader } = PROVIDERS[provider];
  const { value: ProviderComponent } = useAsync(loader);

  return (
    <Step title={title} backStep={FormStep.InputAmount} noPadding={true}>
      {ProviderComponent ? <ProviderComponent /> : <LoadingIndicator />}
    </Step>
  );
});
