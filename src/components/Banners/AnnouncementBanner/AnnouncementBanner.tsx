import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import TreasuryIcon from '../../../images/icons/beefy-treasury.svg';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function AnnouncementBanner() {
  const classes = useStyles();
  const [hideBanner, setHideBanner] = useLocalStorageBoolean('hideTreasuryBanner', false);

  const closeBanner = useCallback(() => {
    setHideBanner(true);
  }, [setHideBanner]);

  if (hideBanner) {
    return null;
  }

  return (
    <Banner
      icon={<img className={classes.icon} src={TreasuryIcon} alt="treasury" />}
      text={
        <>
          Introducing{' '}
          <Link to="/treasury" className={classes.link}>
            Treasury dashboard.
          </Link>{' '}
          Explore our latest UI addition for trustworthy insights into Beefy’s treasury and
          financials.
        </>
      }
      onClose={closeBanner}
    />
  );
});
