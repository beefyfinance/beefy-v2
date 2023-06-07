import { makeStyles } from '@material-ui/core';
import React, { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectUserDepositedVaultIds } from '../data/selectors/balance';
import { DepositSummary } from './components/DepositSummary';
import { NoResults } from './components/NoResults';
import { UserExposure } from './components/UserExposure';
import { UserVaults } from './components/UserVaults';
import { styles } from './styles';
import { useParams } from 'react-router';
import { initViewAsAddress } from '../data/actions/wallet';
import { setViewAsAddress } from '../data/reducers/wallet/wallet';

const useStyles = makeStyles(styles);

type DashboardUrlParams = {
  address?: string;
};

export const Dashboard = memo(function Dashboard() {
  const classes = useStyles();
  const userVaults = useAppSelector(selectUserDepositedVaultIds);
  const dispatch = useAppDispatch();

  const { address } = useParams<DashboardUrlParams>();

  useEffect(() => {
    if (address) {
      console.log(address);
      dispatch(initViewAsAddress({ address }));
      return () => {
        dispatch(setViewAsAddress({ address: null }));
      };
    }
  }, [address, dispatch]);

  return (
    <div className={classes.dashboard}>
      <DepositSummary viewAsAddress={address} />
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
