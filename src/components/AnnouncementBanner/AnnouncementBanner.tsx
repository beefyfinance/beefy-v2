import React, { memo, useCallback } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { useLocalStorageBoolean } from '../../helpers/useLocalStorageBoolean';

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
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.box}>
          <div className={classes.content}>
            <img
              className={classes.icon}
              src={require(`../../images/icons/dashboard.svg`).default}
              alt="dashboard"
            />
            <div>
              New Beefy{' '}
              <Link className={classes.link} to="/dashboard">
                Dashboard
              </Link>{' '}
              is live! Explore your exposure to chains, platforms, tokens and more.
            </div>
          </div>
          <Clear onClick={closeBanner} className={classes.cross} />
        </div>
      </Container>
    </div>
  );
});
