import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Box, Button, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Stats } from './Stats';
import { VaultsStats } from './VaultsStats';
import { styles } from './styles';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';

const useStyles = makeStyles(styles);

export const Portfolio = () => {
  const classes = useStyles();
  const [hideBalance, setHideBalance] = useState(() =>
    localStorage.getItem('hideBalance') === 'true' ? true : false
  );
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
    const newUserVaults = [];

    if (userAddress !== null) {
      for (const poolKey in vaultReducer.pools) {
        const pool = vaultReducer.pools[poolKey];
        const balance = balanceReducer.tokens[pool.network][pool.earnedToken].balance;
        if (balance > 0) {
          pool.balance = balance;
          pool.oraclePrice = pricesReducer.prices[pool.oracleId];
          newUserVaults.push(pool);
        }
      }
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
    localStorage.setItem('hideBalance', JSON.stringify(!hideBalance));
  };

  return (
    <Box className={classes.portfolio}>
      <Container maxWidth="lg">
        <Grid container>
          <Grid item xs={12} lg={6}>
            <Typography className={classes.title}>{t('Portfolio-Portfolio')}</Typography>
            <Stats stats={globalStats} blurred={hideBalance} />
            <Button className={classes.btnHide} onClick={updateHideBalance}>
              {hideBalance ? (
                <React.Fragment>
                  <VisibilityOutlinedIcon />
                  {t('Portfolio-BalanceShow')}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <VisibilityOffOutlinedIcon />
                  {t('Portfolio-BalanceHide')}
                </React.Fragment>
              )}
            </Button>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Box className={classes.vaults}>
              <Typography className={classes.title}>{t('Vault-platform')}</Typography>
              <Box>
                <VaultsStats />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
