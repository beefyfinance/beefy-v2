import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@repo/styles/css';
import { AlertInfo } from '../../../../../components/Alerts/Alerts.tsx';

const cellClass = css({
  backgroundColor: 'background.content',
  padding: '16px',
});

export const PendingIndexNotice = memo(function PendingIndexNotice() {
  const { t } = useTranslation();
  return (
    <div className={cellClass}>
      <AlertInfo>{t('pnl-graph-notice-pending-index')}</AlertInfo>
    </div>
  );
});
