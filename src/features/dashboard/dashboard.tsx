import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useAppSelector } from '../../store';
import { selectIsWalletConnected } from '../data/selectors/wallet';
import { DepositResume } from './components/DepositResume';
import { UserExposure } from './components/UserExposure';
import { UserVaults } from './components/UserVaults';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const Dashboard = memo(function () {
  const classes = useStyles();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  return (
    <div className={classes.dashboard}>
      <DepositResume />
      {isWalletConnected ? (
        <>
          <UserExposure />
          <UserVaults />
        </>
      ) : (
        <div>disconected</div>
      )}
    </div>
  );
});
