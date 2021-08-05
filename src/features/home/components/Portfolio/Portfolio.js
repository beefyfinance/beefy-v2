import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Hidden, makeStyles, Typography } from '@material-ui/core';
import { ExpandLess, ExpandMore, Visibility, VisibilityOff } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import AnimateHeight from 'react-animate-height';
import { Alert } from '@material-ui/lab';
import styles from './styles';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import PortfolioItem from './PortfolioItem';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles(styles);

const Portfolio = () => {
  const location = useLocation();
  const classes = useStyles();
  const [portfolioOpen, setPortfolioOpen] = useState(location.portfolioOpen);
  const [hideBalance, setHideBalance] = useState(false);
  const [userVaults, setUserVaults] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    deposited: BigNumber(0),
    totalYield: BigNumber(0),
    daily: BigNumber(0),
    monthly: BigNumber(0),
  });
  const balanceReducer = useSelector(state => state.balanceReducer);
  const vaultReducer = useSelector(state => state.vaultReducer);
  const pricesReducer = useSelector(state => state.pricesReducer);
  const userAddress = useSelector(state => state.walletReducer.address);
  const t = useTranslation().t;

  const BlurredText = ({ value }) => {
    return <span className={hideBalance ? classes.blurred : ''}>{value}</span>;
  };

  useEffect(() => {
    let newUserVaults = [];

    if (userAddress !== null) {
      Object.keys(balanceReducer.tokens).forEach(tokenName => {
        if (balanceReducer.tokens[tokenName].balance != "0") {
          let target = Object.values(vaultReducer.pools).find(pool => pool.earnedToken === tokenName);
          if (target !== undefined) {
              target.balance = balanceReducer.tokens[tokenName].balance;
              target.oraclePrice = pricesReducer.prices[target.oracleId];
              newUserVaults.push(target);
          }
        }
      })
    }

    setUserVaults(newUserVaults);
  }, [vaultReducer, balanceReducer, userAddress, pricesReducer]);

  useEffect(() => {
    let newGlobalStats = {
      deposited: BigNumber(0),
      totalYield: BigNumber(0),
      daily: BigNumber(0),
      monthly: BigNumber(0),
    };

    if (userVaults.length > 0) {
      userVaults.forEach(vault => {
        let balance = BigNumber(vault.balance);
        balance = balance.times(vault.pricePerFullShare).div('1e18').div('1e18');
        const oraclePrice = pricesReducer.prices[vault.oracleId];
        newGlobalStats.deposited = newGlobalStats.deposited.plus(balance.times(oraclePrice));

        const apy = vault.apy.totalApy || 0;
        const daily = apy / 365;
        newGlobalStats.daily = newGlobalStats.daily.plus(balance.times(daily).times(oraclePrice));
      });

      newGlobalStats.monthly = BigNumber(newGlobalStats.daily).times(30);
    }

    setGlobalStats(newGlobalStats);
  }, [userVaults, vaultReducer, pricesReducer, userAddress]);

  return (
    <Box className={classes.portfolio}>
      <Container maxWidth="xl">
        <Box
          display={'flex'}
          className={[portfolioOpen ? classes.opened : '', classes.mobileFix].join(' ')}
        >
          <Box className={classes.balance}>
            <Button
              onClick={() => {
                setHideBalance(!hideBalance);
              }}
            >
              {hideBalance ? (
                <React.Fragment>
                  <VisibilityOff />
                  {t('Portfolio-BalanceShow')}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Visibility />
                  {t('Portfolio-BalanceHide')}
                </React.Fragment>
              )}
            </Button>
          </Box>
          <Box>
            <Typography className={classes.h1}>{t('Portfolio-Portfolio')}</Typography>
          </Box>
          <Box className={classes.stats}>
            <Box className={classes.stat}>
              <Typography className={classes.h2}>
                <BlurredText value={`$${globalStats.deposited.toFixed(2)}`} />
              </Typography>
              <Typography className={classes.body1}>{t('Portfolio-Deposited')}</Typography>
            </Box>
            <Box className={classes.stat}>
              <Typography className={classes.h2}>
                <BlurredText value={'$0'} />
              </Typography>
              <Typography className={classes.body1}>{t('Portfolio-YieldTot')}</Typography>
            </Box>
            <Box className={classes.stat}>
              <Typography className={classes.h2}>
                <BlurredText value={`$${globalStats.daily.toFixed(2)}`} />
              </Typography>
              <Typography className={classes.body1}>{t('Portfolio-YieldDay')}</Typography>
            </Box>
            <Hidden xsDown>
              <Box className={classes.stat}>
                <Typography className={classes.h2}>
                  <BlurredText value={`$${globalStats.monthly.toFixed(2)}`} />
                </Typography>
                <Typography className={classes.body1}>{t('Portfolio-YieldMnth')}</Typography>
              </Box>
            </Hidden>
          </Box>
        </Box>
        <AnimateHeight duration={500} height={portfolioOpen ? 'auto' : 0}>
          {userVaults.length > 0 ? (
            <>
              {userVaults.map(vault => (
                <Box key={vault.id}>
                  <PortfolioItem item={vault} />
                </Box>
              ))}
            </>
          ) : (
            <Box>
              <Alert severity="info">No vaults found for this portfolio.</Alert>
            </Box>
          )}
        </AnimateHeight>
        <Box display="flex">
          <Box m="auto">
            <Button
              className={classes.toggler}
              onClick={() => {
                setPortfolioOpen(!portfolioOpen);
              }}
            >
              {portfolioOpen ? <ExpandLess /> : <ExpandMore />}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Portfolio;
