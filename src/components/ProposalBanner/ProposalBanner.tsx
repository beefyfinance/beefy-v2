import React, { memo, useRef } from 'react';
import { Container, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { Clear } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { sample } from 'lodash';

const useStyles = makeStyles(styles);

export const ProposalBanner = memo(function ProposalBanner() {
  const classes = useStyles();

  const [bifiCardIndex, setBifiCardIndex] = React.useState(1);

  const [showProposalBanner, setShowProposalBanner] = React.useState(() => {
    try {
      const storageValue = localStorage.getItem('hideOnRampBanner');
      return storageValue !== 'true';
    } catch {
      return true;
    }
  });

  const intervalRef: any = useRef();

  React.useEffect(() => {
    const setRandomCardIndex = () => {
      setBifiCardIndex(sample([1, 2]));
    };

    intervalRef.current = setInterval(setRandomCardIndex, 3000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const closeBanner = React.useCallback(() => {
    setShowProposalBanner(false);
    try {
      localStorage.setItem('hideOnRampBanner', 'true');
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
                  src={require(`../../images/icons/beefy-card-${bifiCardIndex}.png`).default}
                  alt="snapshot"
                />
                <div>
                  The new Beefy On-Ramp is live:
                  <Link to={'/onramp'} className={classes.link}>
                    {' '}
                    Buy Crypto
                  </Link>{' '}
                  using card or bank transfer from selected providers
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
