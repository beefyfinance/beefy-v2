import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import clsx from 'clsx';
import { selectErrorBar, selectStepperProgress } from '../../../../features/data/selectors/stepper';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const ProgressBar = memo(function () {
  const progress = useAppSelector(selectStepperProgress);
  const classes = useStyles({ progress });
  const showErrorBar = useAppSelector(selectErrorBar);

  return (
    <div className={classes.topBar}>
      <div
        className={clsx({
          [classes.progressBar]: !showErrorBar,
          [classes.errorBar]: showErrorBar,
        })}
      />
    </div>
  );
});
