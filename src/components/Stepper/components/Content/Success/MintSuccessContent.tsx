import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { selectMintResult } from '../../../../../features/data/selectors/stepper.ts';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { SuccessContentDisplay } from './SuccessContentDisplay.tsx';
import type { SuccessContentProps } from './types.ts';

export const MintSuccessContent = memo(function MintSuccessContent({ step }: SuccessContentProps) {
  const { t } = useTranslation();
  const { type, amount, token } = useAppSelector(selectMintResult);

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={t(`Stepper-${step.step}-${type}-Success-Content`, { amount, token: token.symbol })}
    />
  );
});
