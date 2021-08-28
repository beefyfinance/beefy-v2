import React, { memo } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import styles from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

function SafetyScore({ score, whiteLabel, size = 'lg' }) {
  const classes = useStyles();
  const scoreText = score === 0 ? '-' : score;

  return (
    <div
      className={clsx(classes.container, {
        [classes.withSizeLarge]: size === 'lg',
        [classes.withWhiteLabel]: whiteLabel,
        [classes.withScoreHigh]: score > 7.5,
        [classes.withScoreMed]: score > 4 && score <= 7.5,
        [classes.withScoreLow]: score > 0 && score <= 4,
      })}
    >
      <Typography className={classes.label}>{scoreText}</Typography>
      <div className={classes.barsContainer}>
        <div className={clsx(classes.bar, classes.sm)} />
        <div className={clsx(classes.bar, classes.md)} />
        <div className={clsx(classes.bar, classes.lg)} />
      </div>
    </div>
  );
}

export default memo(SafetyScore);
