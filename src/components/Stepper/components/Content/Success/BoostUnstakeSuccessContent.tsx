import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  selectBoostAdditionalData,
  selectBoostClaimed,
} from '../../../../../features/data/selectors/stepper.ts';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { formatTokenAmountsList } from '../common/formatTokenAmountsList.tsx';
import { SuccessContentDisplay } from './SuccessContentDisplay.tsx';
import type { SuccessContentProps } from './types.ts';

export const BoostUnstakeSuccessContent = memo(function BoostUnstakeSuccessContent({
  step,
}: SuccessContentProps) {
  const { t } = useTranslation();
  const data = useAppSelector(selectBoostAdditionalData);
  const token = data?.token.symbol || 'UNKNOWN';
  const amount = formatTokenDisplayCondensed(data?.amount || BIG_ZERO, data?.token.decimals || 18);
  const claimedTokenAmounts = useAppSelector(selectBoostClaimed);
  const claimed = useMemo(() => {
    if (claimedTokenAmounts.length) {
      return formatTokenAmountsList(claimedTokenAmounts);
    }
    return undefined;
  }, [claimedTokenAmounts]);

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={t(`Stepper-${step.step}-Success-Content`, { amount, token })}
      messageHighlight={
        claimed ?
          <Trans t={t} i18nKey={`Stepper-boost-claim-Rewards`} components={{ claimed }} />
        : undefined
      }
    />
  );
});
