import type { CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import type { StockMarketClosedState } from '../hooks/useStockMarketClosedState.ts';

export type StockMarketClosedNoticeProps = {
  state: StockMarketClosedState;
  css?: CssStyles;
};

export const StockMarketClosedNotice = memo(function StockMarketClosedNotice({
  state,
  css: cssProp,
}: StockMarketClosedNoticeProps) {
  const { t } = useTranslation();
  const { shouldConfirm, confirmed, setConfirmed } = state;

  if (!shouldConfirm) {
    return null;
  }

  return (
    <AlertWarning css={cssProp}>
      <p>{t('Transact-Notice-StockMarketClosed')}</p>
      <LabelledCheckbox
        onChange={setConfirmed}
        checked={confirmed}
        label={t('Transact-Notice-StockMarketClosed-Confirm')}
      />
    </AlertWarning>
  );
});
