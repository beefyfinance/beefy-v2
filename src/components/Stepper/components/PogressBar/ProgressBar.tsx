import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import clsx from 'clsx';
import {
  selectErrorBar,
  selectIsProgressBar25,
  selectIsProgressBar50,
  selectIsProgressBar60,
  selectIsProgressBar70,
  selectIsProgressBar75,
  selectIsProgressBar80,
  selectIsProgressBar90,
  selectSuccessBar,
} from '../../../../features/data/selectors/stepper';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const ProgressBar = memo(function () {
  const classes = useStyles();

  const showProgressbar25 = useAppSelector(selectIsProgressBar25);
  const showProgressbar50 = useAppSelector(selectIsProgressBar50);
  const showProgressbar60 = useAppSelector(selectIsProgressBar60);
  const showProgressbar70 = useAppSelector(selectIsProgressBar70);
  const showProgressbar75 = useAppSelector(selectIsProgressBar75);
  const showProgressbar80 = useAppSelector(selectIsProgressBar80);
  const showProgressbar90 = useAppSelector(selectIsProgressBar90);
  const showSuccesBar = useAppSelector(selectSuccessBar);
  const showErrorBar = useAppSelector(selectErrorBar);

  return (
    <div className={classes.topBar}>
      <div
        className={clsx({
          [classes.errorBar]: showErrorBar,
          [classes.successBar]: showSuccesBar,
          [classes.progressBar90]: showProgressbar90,
          [classes.progressBar80]: showProgressbar80,
          [classes.progressBar75]: showProgressbar75,
          [classes.progressBar70]: showProgressbar70,
          [classes.progressBar60]: showProgressbar60,
          [classes.progressBar50]: showProgressbar50,
          [classes.progressBar25]: showProgressbar25,
        })}
      />
    </div>
  );
});
