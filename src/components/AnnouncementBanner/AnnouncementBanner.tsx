import React, { memo } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export const AnnouncementBanner = memo(function ProposalBanner() {
  const classes = useStyles();

  const [showBanner, setShowBanner] = React.useState(() => {
    try {
      const storageValue = localStorage.getItem('hideBip58Banner');
      return storageValue !== 'true';
    } catch {
      return true;
    }
  });

  const closeBanner = React.useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem('hideBip58Banner', 'true');
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
                  src={require(`../../images/partners/snapshot-logo.svg`).default}
                  alt="snapshot"
                />
                <div>
                  [BIP:58] Adopt Governance Guidelines. Discuss on
                  <a className={classes.link} target="__blank" href="https://discord.gg/yq8wfHd">
                    {' '}
                    Discord{' '}
                  </a>
                  and vote on
                  <a
                    target="__blank"
                    className={classes.link}
                    href="https://vote.beefy.finance/#/proposal/0x90e15a8ba3cfa8b9539b6a428130ae2987d77336ed6f9005f198b744552bc081"
                  >
                    {' '}
                    Snapshot.
                  </a>
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
