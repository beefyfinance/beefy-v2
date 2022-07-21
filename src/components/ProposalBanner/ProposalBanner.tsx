import React from 'react';
import { Box, Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export const ProposalBanner = () => {
  const classes = useStyles();

  const [showProposalBanner, setShowProposalBanner] = React.useState(() => {
    const storageValue = localStorage.getItem('showProposalBanner');
    if (storageValue === 'false') {
      return false;
    } else {
      if (storageValue === null) localStorage.setItem('showProposalBanner', 'true');
      return true;
    }
  });

  const closeBanner = React.useCallback(() => {
    localStorage.setItem('showProposalBanner', 'false');
    setShowProposalBanner(false);
  }, []);

  return (
    <>
      {showProposalBanner ? (
        <Box className={classes.container}>
          <Container maxWidth="lg">
            <Box className={classes.box}>
              <Box className={classes.content}>
                <img
                  className={classes.icon}
                  src={require('../../images/snapshot-logo.svg').default}
                  alt="snapshot"
                />
                <Box>
                  [BIP-45] Protocol Sustainability is live, please cast your
                  <a
                    href="https://vote.beefy.finance/#/proposal/0xb070348f6c2cc229f2bcdc0c042077ee8eab4307a307b89537f8a78089b0c2eb"
                    target="_blank"
                    rel="noreferrer"
                    className={classes.link}
                  >
                    vote!
                  </a>
                </Box>
              </Box>
              <Clear onClick={closeBanner} className={classes.cross} />
            </Box>
          </Container>
        </Box>
      ) : null}
    </>
  );
};
