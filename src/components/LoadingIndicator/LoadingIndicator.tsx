import React, { memo } from 'react';
import { CircularProgress, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export type LoadingIndicatorProps = {
  text?: string;
  className?: string;
};
export const LoadingIndicator = memo<LoadingIndicatorProps>(function LoadingIndicator({
  text,
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={clsx(classes.container, className)}>
      <CircularProgress className={classes.icon} />
      <div className={classes.text}>{text ?? t('Loading')}</div>
    </div>
  );
});
