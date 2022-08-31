import React, { memo } from 'react';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { selectSelectedQuote } from '../../../../../data/selectors/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import { PROVIDERS } from '../../providers';
import { ProviderFrame } from './ProviderFrame';

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
  const { title } = PROVIDERS[provider];

  return (
    <Step title={title} backStep={FormStep.InputAmount} noPadding={true}>
      <ProviderFrame />
    </Step>
  );
});
