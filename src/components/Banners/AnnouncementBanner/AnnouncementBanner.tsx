import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Link } from 'react-router-dom';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import dashboardIconUrl from '../../../images/icons/dashboard.svg';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideDashboardBanner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img className={classes.icon} src={dashboardIconUrl} alt="dashboard" />}
      text={
        <>
          New Beefy{' '}
          <Link className={classes.link} to="/dashboard">
            Dashboard
          </Link>{' '}
          is live! Explore your exposure to chains, platforms, tokens and more.
        </>
      }
      onClose={closeBanner}
    />
  );
});
