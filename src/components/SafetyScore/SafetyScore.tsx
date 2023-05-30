import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type SafetyScoreProps = {
  score: number;
  size: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
};

export const SafetyScore = memo<SafetyScoreProps>(function SafetyScore({
  score,
  size = 'sm',
  align = 'left',
  className,
}) {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.container, className, {
        [classes.withSizeMedium]: size === 'md',
        [classes.withScoreHigh]: score > 7.5,
        [classes.withScoreMed]: score >= 6.4 && score <= 7.5,
        [classes.withScoreLow]: score > 0 && score <= 6.4,
        [classes.withRightAlign]: align === 'right',
      })}
    >
      <div className={classes.barsContainer}>
        <div className={clsx(classes.bar, classes.sm)} />
        <div className={clsx(classes.bar, classes.md)} />
        <div className={clsx(classes.bar, classes.lg)} />
      </div>
    </div>
  );
});
