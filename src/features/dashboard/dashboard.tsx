import { makeStyles } from '@material-ui/core';
import React, { memo, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { selectUserDepositedVaultIds } from '../data/selectors/balance';
import { DepositSummary } from './components/DepositSummary';
import { NoResults } from './components/NoResults';
import { UserExposure } from './components/UserExposure';
import { UserVaults } from './components/UserVaults';
import { styles } from './styles';
import { useInitDashboard } from './hooks';
import { useHistory } from 'react-router';
import { selectConnectedWalletAddress } from '../data/selectors/wallet';
import { TechLoader } from '../../components/TechLoader';

const useStyles = makeStyles(styles);

export const Dashboard = memo(function Dashboard() {
  const classes = useStyles();
  const { userAddress, error, loading } = useInitDashboard();
  const userVaults = useAppSelector(state => selectUserDepositedVaultIds(state, userAddress));
  const connectedWalletAddress = useAppSelector(state => selectConnectedWalletAddress(state));
  const history = useHistory();

  useEffect(() => {
    if (!userAddress && connectedWalletAddress) {
      history.push(`/dashboard/${connectedWalletAddress}`);
    }
  }, [connectedWalletAddress, history, userAddress]);

  return (
    <div className={classes.dashboard}>
      <DepositSummary loading={loading} viewAsAddress={userAddress} />
      {loading ? (
        <TechLoader />
      ) : userVaults.length > 0 && userAddress ? (
        <>
          <UserExposure />
          <UserVaults />
        </>
      ) : (
        <NoResults error={error} viewAsAddress={userAddress} />
      )}
    </div>
  );
});
