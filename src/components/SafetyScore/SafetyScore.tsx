import React, { memo } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles as any);
const _SafetyScore = ({
  score,
  whiteLabel = false,
  size = 'lg',
}: {
  score: number;
  whiteLabel?: boolean;
  size: 'sm' | 'lg' | 'md';
}) => {
  const classes = useStyles();
  const scoreText = score === 0 ? '-' : score.toFixed(1);

  return (
    <div
      className={clsx(classes.container, {
        [classes.withSizeLarge]: size === 'lg',
        [classes.withSizeMedium]: size === 'md',
        [classes.withWhiteLabel]: whiteLabel,
        [classes.withScoreHigh]: score > 7.5,
        [classes.withScoreMed]: score > 4 && score <= 7.5,
        [classes.withScoreLow]: score > 0 && score <= 4,
      })}
    >
      <Typography variant="h3" className={classes.label}>
        {scoreText}
      </Typography>
      <div className={classes.barsContainer}>
        <div className={clsx(classes.bar, classes.sm)} />
        <div className={clsx(classes.bar, classes.md)} />
        <div className={clsx(classes.bar, classes.lg)} />
      </div>
    </div>
  );
};

export const SafetyScore = memo(_SafetyScore);
