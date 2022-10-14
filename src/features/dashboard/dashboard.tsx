import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { DepositResume } from './components/DepositResume';
import { UserExposure } from './components/UserExposure';
import { UserVaults } from './components/UserVaults';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const Dashboard = memo(function () {
  const classes = useStyles();
  return (
    <div className={classes.dashboard}>
      <DepositResume />
      <UserExposure />
      <UserVaults />
    </div>
  );
});
