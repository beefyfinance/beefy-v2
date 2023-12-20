import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import techLoader from '../../images/tech-loader.gif';

const useStyles = makeStyles(styles);

export type LoadingIndicatorProps = {
  text?: string;
  className?: string;
  height?: number;
  width?: number;
};
export const LoadingIndicator = memo<LoadingIndicatorProps>(function LoadingIndicator({
  text,
  className,
  height = 80,
  width = 80,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={clsx(classes.container, className)}>
      <img
        src={techLoader}
        height={height}
        width={width}
        alt="tech loader"
        className={classes.icon}
      />
      <div className={classes.text}>{text ?? t('Loading')}</div>
    </div>
  );
});
