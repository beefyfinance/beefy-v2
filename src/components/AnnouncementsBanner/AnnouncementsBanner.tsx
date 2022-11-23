import React, { memo } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(styles);

export const AnnouncementsBanner = memo(function ProposalBanner() {
  const classes = useStyles();

  const [showBanner, setShowBanner] = React.useState(() => {
    try {
      const storageValue = localStorage.getItem('hideDashboardBanner');
      return storageValue !== 'true';
    } catch {
      return true;
    }
  });

  const closeBanner = React.useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem('hideDashboardBanner', 'true');
    } catch (error) {
      // swallow error
    }
  }, [setShowBanner]);

  return (
    <>
      {showBanner ? (
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
      ) : null}
    </>
  );
});
