import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import clsx from 'clsx';
import {
  selectErrorBar,
  selectStepperProgress,
  selectSuccessBar,
} from '../../../../features/data/selectors/stepper';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const ProgressBar = memo(function () {
  const progress = useAppSelector(selectStepperProgress);
  const classes = useStyles({ progress });
  const showErrorBar = useAppSelector(selectErrorBar);
  const showSuccessBar = useAppSelector(selectSuccessBar);

  return (
    <div className={classes.topBar}>
      <div
        className={clsx({
          [classes.errorBar]: showErrorBar,
          [classes.successBar]: showSuccessBar,
          [classes.progressBar]: !showErrorBar && !showSuccessBar,
        })}
      />
    </div>
  );
});
