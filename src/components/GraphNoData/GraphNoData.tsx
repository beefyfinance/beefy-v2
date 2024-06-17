import { type FC, memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { AlertError, AlertInfo, type AlertProps, AlertWarning } from '../Alerts';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export type NoGraphDataReason = 'error' | 'error-retry' | 'wait-collect';

export type NoGraphDataProps = {
  className?: string;
  reason: NoGraphDataReason;
};

const ReasonToAlertComponent = {
  error: AlertError,
  'error-retry': AlertWarning,
  'wait-collect': AlertInfo,
} as const satisfies Record<NoGraphDataReason, FC<Omit<AlertProps, 'IconComponent'>>>;

export const GraphNoData = memo<NoGraphDataProps>(function GraphNoData({ className, reason }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const AlertComponent = ReasonToAlertComponent[reason];

  return (
    <div className={clsx(classes.container, className)}>
      <AlertComponent>{t(`Graph-No-Data-${reason}`)}</AlertComponent>
    </div>
  );
});
