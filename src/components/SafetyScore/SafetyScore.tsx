import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type SafetyScoreProps = {
  score: number;
  whiteLabel?: boolean;
  colorLabel?: boolean;
  size: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
};

export const SafetyScore = memo<SafetyScoreProps>(function SafetyScore({
  score,
  whiteLabel = false,
  colorLabel = false,
  size = 'sm',
  align = 'left',
  className,
}) {
  const classes = useStyles();
  const scoreText = score === 0 ? '-' : score.toFixed(1);

  return (
    <div
      className={clsx(classes.container, className, {
        [classes.withSizeMedium]: size === 'md',
        [classes.withWhiteLabel]: whiteLabel,
        [classes.withColorLabel]: colorLabel,
        [classes.withScoreHigh]: score > 7.5,
        [classes.withScoreMed]: score > 4 && score <= 7.5,
        [classes.withScoreLow]: score > 0 && score <= 4,
        [classes.withRightAlign]: align === 'right',
      })}
    >
      <div className={classes.label}>{scoreText}</div>
      <div className={classes.barsContainer}>
        <div className={clsx(classes.bar, classes.sm)} />
        <div className={clsx(classes.bar, classes.md)} />
        <div className={clsx(classes.bar, classes.lg)} />
      </div>
    </div>
  );
});
