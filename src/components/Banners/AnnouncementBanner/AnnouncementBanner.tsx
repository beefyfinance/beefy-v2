import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useLocalStorageBoolean } from '../../../helpers/useLocalStorageBoolean';
import { Banner } from '../Banner';
import GraphIcon from '../../../images/icons/graph.png';

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
      icon={<img className={classes.icon} src={GraphIcon} alt="graph" />}
      text={
        <>
          Introducing the <span className={classes.link}> Beefy Yield Module: </span> a new
          analytics tool that provides deeper insights into your investment's evolution. Visit any
          of your active vaults and check it out!
        </>
      }
      onClose={closeBanner}
    />
  );
});
