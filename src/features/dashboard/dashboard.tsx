import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useAppSelector } from '../../store';
import { selectUserDepositedVaultIds } from '../data/selectors/balance';
import { DepositSummary } from './components/DepositSummary';
import { NoResults } from './components/NoResults';
import { UserExposure } from './components/UserExposure';
import { UserVaults } from './components/UserVaults';
import { styles } from './styles';
import { useInitDashboard } from './hooks';
import { TechLoader } from '../../components/TechLoader';

const useStyles = makeStyles(styles);

export const Dashboard = memo(function Dashboard() {
  const classes = useStyles();
  const { userAddress, error, loading } = useInitDashboard();
  const userVaults = useAppSelector(state => selectUserDepositedVaultIds(state, userAddress));

  return (
    <div className={classes.dashboard}>
      <DepositSummary error={error} loading={loading} />
      {loading ? (
        <TechLoader />
      ) : userVaults.length > 0 && userAddress && !error ? (
        <>
          <UserExposure />
          <UserVaults />
        </>
      ) : (
        <NoResults error={error} />
      )}
    </div>
  );
});
