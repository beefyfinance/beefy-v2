import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { DaoExposure } from './components/DaoExposure';
import { DaoInflows } from './components/DaoInflows';
import { DaoSummary } from './components/DaoSummary';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const Treasury = memo(function () {
  const classes = useStyles();
  return (
    <div className={classes.treasury}>
      <DaoSummary />
      <DaoExposure />
      <DaoInflows />
    </div>
  );
});
