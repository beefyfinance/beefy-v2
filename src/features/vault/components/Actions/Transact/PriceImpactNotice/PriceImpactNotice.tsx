import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { formatLargePercent } from '../../../../../../helpers/format.ts';
import type { PriceImpactState } from '../hooks/usePriceImpactState.ts';
import { type CssStyles } from '@repo/styles/css';

export type PriceImpactNoticeProps = {
  state: PriceImpactState;
  hideCheckbox?: boolean;
  css?: CssStyles;
};

export const PriceImpactNotice = memo(function PriceImpactNotice({
  state,
  css: cssProp,
  hideCheckbox = false,
}: PriceImpactNoticeProps) {
  const { t } = useTranslation();
  const { shouldWarn, shouldConfirm, priceImpact, confirmed, setConfirmed } = state;

  if (!shouldWarn) {
    return null;
  }

  const AlertComponent = shouldConfirm ? AlertError : AlertWarning;

  return (
    <AlertComponent css={cssProp}>
      <p>
        {t('Transact-Notice-PriceImpact', {
          priceImpact: formatLargePercent(-priceImpact, 2, '0.00%'),
        })}
      </p>
      {shouldConfirm && !hideCheckbox ?
        <LabelledCheckbox
          onChange={setConfirmed}
          checked={confirmed}
          label={t('Transact-Notice-PriceImpact-Confirm')}
        />
      : null}
    </AlertComponent>
  );
});
