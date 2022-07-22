import React, { memo } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export const ProposalBanner = memo(function ProposalBanner() {
  const classes = useStyles();

  const [showProposalBanner, setShowProposalBanner] = React.useState(() => {
    try {
      const storageValue = localStorage.getItem('hideProposalBanner');
      return storageValue !== 'true';
    } catch {
      return true;
    }
  });

  const closeBanner = React.useCallback(() => {
    setShowProposalBanner(false);
    try {
      localStorage.setItem('hideProposalBanner', 'true');
    } catch (error) {
      // swallow error
    }
  }, [setShowProposalBanner]);

  return (
    <>
      {showProposalBanner ? (
        <div className={classes.container}>
          <Container maxWidth="lg">
            <div className={classes.box}>
              <div className={classes.content}>
                <img
                  className={classes.icon}
                  src={require('../../images/snapshot-logo.svg').default}
                  alt="snapshot"
                />
                <div>
                  New proposal is live: [BIP-45] Protocol Sustainability. Discuss on{' '}
                  <a
                    href="https://discord.gg/dfxjT3rHZB"
                    target="_blank"
                    rel="noreferrer"
                    className={classes.link}
                  >
                    Discord
                  </a>{' '}
                  and vote on{' '}
                  <a
                    href="https://vote.beefy.finance/#/proposal/0xb070348f6c2cc229f2bcdc0c042077ee8eab4307a307b89537f8a78089b0c2eb"
                    target="_blank"
                    rel="noreferrer"
                    className={classes.link}
                  >
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
