import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { selectBoostAdditionalData } from '../../../../../features/data/selectors/stepper.ts';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { SuccessContentDisplay } from './SuccessContentDisplay.tsx';
import type { SuccessContentProps } from './types.ts';

export const BoostStakeSuccessContent = memo(function BoostStakeSuccessContent({
  step,
}: SuccessContentProps) {
  const { t } = useTranslation();
  const data = useAppSelector(selectBoostAdditionalData);
  const token = data?.token.symbol || 'UNKNOWN';
  const amount = data?.amount || BIG_ZERO;

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={t(`Stepper-${step.step}-Success-Content`, { amount, token })}
      rememberTitle={t('Remember')}
      rememberMessage={t('Remember-Msg-Boost')}
    />
  );
});
