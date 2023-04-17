import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import DashboardIcon from '../../../images/icons/dashboard.svg';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideYieldModule', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img className={classes.icon} src={DashboardIcon} alt="graph" />}
      text={
        <>
          Beefy{' '}
          <Link className={classes.link} to="/dashboard">
            Dashboard
          </Link>{' '}
          just got better! The updated version now shows your accrued yield, PNL, transaction
          history, claimable boost rewards and more.
        </>
      }
      onClose={closeBanner}
    />
  );
});
