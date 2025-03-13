import { memo, useCallback } from 'react';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectSelectedQuote } from '../../../../../data/selectors/on-ramp.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { PROVIDERS } from '../../providers.tsx';
import { ProviderFrame } from './ProviderFrame.tsx';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';

export const InjectProviderStep = memo(function InjectProviderStep() {
  const quote = useAppSelector(selectSelectedQuote);
  const supported = quote.provider in PROVIDERS;

  if (supported) {
    return <Provider provider={quote.provider} />;
  }

  return <ProviderNotSupported provider={quote.provider} />;
});

const ProviderNotSupported = memo(function ProviderNotSupported({
  provider,
}: {
  provider: string;
}) {
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

const Provider = memo(function Provider({ provider }: { provider: string }) {
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
