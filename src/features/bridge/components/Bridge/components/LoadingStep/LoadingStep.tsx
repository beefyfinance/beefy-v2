import React, { memo } from 'react';
import { Step } from '../Step';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const LoadingStep = memo(function () {
  const classes = useStyles();

  return (
    <Step contentClass={classes.customHeight} title={null}>
      <LoadingIndicator />
    </Step>
  );
});
