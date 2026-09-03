import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { SuccessContentDisplay } from './SuccessContentDisplay.tsx';
import type { SuccessContentProps } from './types.ts';

export const FallbackSuccessContent = memo(function FallbackSuccessContent({
  step,
}: SuccessContentProps) {
  const { t } = useTranslation();
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const hasRememberMsg = step.step === 'deposit';
  const rememberMsg = useMemo(() => {
    if (step.step === 'deposit') {
      return 'Remember-Msg';
    }
    return '';
  }, [step.step]);

  const textParams = useMemo(() => {
    if (step.extraInfo?.rewards) {
      return {
        amount: formatTokenDisplayCondensed(
          walletActionsState?.additional?.amount || BIG_ZERO,
          walletActionsState?.additional?.token?.decimals || 18
        ),
        token: walletActionsState?.additional?.token.symbol || 'unknown',
        rewards: formatTokenDisplayCondensed(
          step.extraInfo.rewards.amount,
          step.extraInfo.rewards.token.decimals
        ),
        rewardToken: step.extraInfo.rewards.token.symbol,
      };
    }
    return {
      amount: formatTokenDisplayCondensed(
        walletActionsState?.additional?.amount || BIG_ZERO,
        walletActionsState?.additional?.token?.decimals || 18
      ),
      token: walletActionsState.additional?.token.symbol || 'unknown',
    };
  }, [step.extraInfo?.rewards, walletActionsState]);

  const successMessage = useMemo(() => {
    return t(`Stepper-${step.step}-Success-Content`, { ...textParams });
  }, [step.step, t, textParams]);

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={successMessage}
      rememberTitle={hasRememberMsg ? t('Remember') : undefined}
      rememberMessage={hasRememberMsg ? t(rememberMsg) : undefined}
      shareVaultId={
        step.step === 'deposit' || step.step === 'deposit-gov' ? step.extraInfo?.vaultId : undefined
      }
    />
  );
});
