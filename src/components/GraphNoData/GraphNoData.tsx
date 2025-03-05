import { type FC, memo } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { AlertError, AlertInfo, AlertWarning } from '../Alerts/Alerts.tsx';
import { useTranslation } from 'react-i18next';
import type { AlertProps } from '../Alerts/types.ts';

export type NoGraphDataReason = 'error' | 'error-retry' | 'wait-collect';

export type NoGraphDataProps = {
  css?: CssStyles;
  reason: NoGraphDataReason;
};

const ReasonToAlertComponent = {
  error: AlertError,
  'error-retry': AlertWarning,
  'wait-collect': AlertInfo,
} as const satisfies Record<NoGraphDataReason, FC<Omit<AlertProps, 'IconComponent'>>>;

export const GraphNoData = memo(function GraphNoData({ css: cssProp, reason }: NoGraphDataProps) {
  const { t } = useTranslation();
  const AlertComponent = ReasonToAlertComponent[reason];

  return (
    <div className={css(styles.container, cssProp)}>
      <AlertComponent>{t(`Graph-No-Data-${reason}`)}</AlertComponent>
    </div>
  );
});
