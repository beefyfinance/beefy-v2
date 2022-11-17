import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useAppSelector } from '../../store';
import { selectUserDepositedVaults } from '../data/selectors/balance';
import { DepositSummary } from './components/DepositSummary';
import { NoResults } from './components/NoResults';
import { UserExposure } from './components/UserExposure';
import { UserVaults } from './components/UserVaults';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const Dashboard = memo(function () {
  const classes = useStyles();
  const userVaults = useAppSelector(selectUserDepositedVaults);
  return (
    <div className={classes.dashboard}>
      <DepositSummary />
      {userVaults.length > 0 ? (
        <>
          <UserExposure />
          <UserVaults />
        </>
      ) : (
        <NoResults />
      )}
    </div>
  );
});
