import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Box, Button, Container, makeStyles, Typography } from '@material-ui/core';
import { ExpandLess, ExpandMore, Visibility, VisibilityOff } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import AnimateHeight from 'react-animate-height';
import { Alert } from '@material-ui/lab';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

import chartData from 'helpers/chartData';
import PortfolioItem from './PortfolioItem';
import Stats from './Stats';
import styles from './styles';

const useStyles = makeStyles(styles);

const Portfolio = () => {
  const location = useLocation();
  const classes = useStyles();
  const [portfolioOpen, setPortfolioOpen] = useState(location.portfolioOpen);
  const [hideBalance, setHideBalance] = useState(localStorage.getItem('HideBalance'));
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

  useEffect(() => {
    let newUserVaults = [];

    if (userAddress !== null) {
      Object.keys(balanceReducer.tokens).forEach(tokenName => {
        // eslint-disable-next-line eqeqeq
        if (balanceReducer.tokens[tokenName].balance != '0') {
          let target = Object.values(vaultReducer.pools).find(
            pool => pool.earnedToken === tokenName
          );
          if (target !== undefined) {
            target.balance = balanceReducer.tokens[tokenName].balance;
            target.oraclePrice = pricesReducer.prices[target.oracleId];
            newUserVaults.push(target);
          }
        }
      });
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

  const updateHideBalance = () => {
    setHideBalance(!hideBalance);
    localStorage.setItem('HideBalance', !hideBalance);
  };

  return (
    <Box className={classes.portfolio}>
      <Container maxWidth="lg">
        <Box
          display={'flex'}
          className={[portfolioOpen ? classes.opened : '', classes.mobileFix].join(' ')}
        >
          <Box className={classes.balance}>
            <Button onClick={updateHideBalance}>
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
            <Typography className={classes.title}>{t('Portfolio-Portfolio')}</Typography>
          </Box>
          <Stats stats={globalStats} blurred={hideBalance} />
        </Box>
        <AnimateHeight duration={500} height={portfolioOpen ? 'auto' : 0}>
          {userVaults.length > 0 ? (
            <>
              {userVaults.map(vault => (
                <Box key={vault.id}>
                  <PortfolioItem
                    item={vault}
                    historicalApy={chartData(
                      pricesReducer.historicalApy,
                      pricesReducer.apy,
                      vault.id
                    )}
                  />
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
