import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { Box, Button, Container, Grid, makeStyles, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Stats } from './Stats';
import { byDecimals } from '../../../../helpers/format';
import { VaultsStats } from './VaultsStats';
import { styles } from './styles';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import { useHideBalanceCtx } from '../../../../components/HideBalancesContext';
import { useVaults } from '../../hooks/useFilteredVaults';
import { isEmpty } from '../../../../helpers/utils';
import { useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles(styles as any);
export const Portfolio = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { hideBalance, setHideBalance } = useHideBalanceCtx();

  const [globalStats, setGlobalStats] = useState({
    deposited: new BigNumber(0),
    totalYield: new BigNumber(0),
    daily: new BigNumber(0),
    monthly: new BigNumber(0),
  });
  const balanceReducer = useSelector((state: any) => state.balanceReducer);
  const pricesReducer = useSelector((state: any) => state.pricesReducer);
  const userAddress = useSelector((state: any) => state.walletReducer.address);
  const { userVaults } = useVaults();
  const t = useTranslation().t;

  useEffect(() => {
    let newGlobalStats = {
      deposited: new BigNumber(0),
      totalYield: new BigNumber(0),
      daily: new BigNumber(0),
      monthly: new BigNumber(0),
    };

    console.log(userVaults);
    if (userAddress && userVaults) {
      Object.keys(userVaults).map(_vault => {
        const vault = userVaults[_vault];
        let symbol = vault.isGovVault ? `${vault.token}GovVault` : vault.earnedToken;
        let balance = new BigNumber(0);
        if (vault.isGovPool) {
          balance = byDecimals(
            balanceReducer.tokens[vault.network][symbol].balance,
            vault.tokenDecimals
          );
          newGlobalStats.deposited = newGlobalStats.deposited.plus(
            balance.times(pricesReducer.prices[vault.oracleId])
          );
        } else {
          balance = byDecimals(
            new BigNumber(balanceReducer.tokens[vault.network][vault.earnedToken].balance)
              .multipliedBy(byDecimals(vault.pricePerFullShare))
              .toFixed(8),
            vault.tokenDecimals
          );
          newGlobalStats.deposited = newGlobalStats.deposited.plus(
            balance.times(pricesReducer.prices[vault.oracleId])
          );
        }
        if (vault.isBoosted) {
          const boost = vault.boostData;
          let symbol = `${boost.token}${boost.id}Boost`;
          if (!isEmpty(balanceReducer.tokens[vault.network][symbol])) {
            balance = byDecimals(
              new BigNumber(balanceReducer.tokens[vault.network][symbol].balance).multipliedBy(
                byDecimals(vault.pricePerFullShare)
              ),
              vault.tokenDecimals
            );
            newGlobalStats.deposited = newGlobalStats.deposited.plus(
              balance.times(pricesReducer.prices[vault.oracleId])
            );
          }
        }
        const apy = vault.isGovVault ? vault.apy.vaultApr : vault.apy.totalApy || 0;

        const daily = vault.isGovVault ? apy / 365 : Math.pow(10, Math.log10(apy + 1) / 365) - 1;

        newGlobalStats.daily = newGlobalStats.daily.plus(
          balance.times(daily).times(pricesReducer.prices[vault.oracleId])
        );
        newGlobalStats.monthly = new BigNumber(newGlobalStats.daily).times(30);
        return true;
      });
    }

    setGlobalStats(newGlobalStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricesReducer, userAddress, balanceReducer.tokens]);

  const updateHideBalance = () => {
    setHideBalance(!hideBalance);
    localStorage.setItem('hideBalance', JSON.stringify(!hideBalance));
  };

  return (
    <Box className={classes.portfolio}>
      <Container maxWidth="lg">
        <Grid container>
          <Grid item xs={12} lg={6}>
            <Box className={classes.titles}>
              <Typography variant="h3" className={classes.title}>
                {t('Portfolio-Portfolio')}
              </Typography>
              <Button className={classes.btnHide} onClick={updateHideBalance}>
                {hideBalance ? (
                  <VisibilityOutlinedIcon htmlColor={`${theme.palette.primary.main}`} />
                ) : (
                  <VisibilityOffOutlinedIcon htmlColor={`${theme.palette.primary.main}`} />
                )}
              </Button>
            </Box>
            <Stats stats={globalStats} blurred={hideBalance} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <Box className={classes.vaults}>
              <Typography variant="h3" className={classes.title2}>
                {t('Vault-platform')}
              </Typography>
              <Box>
                <VaultsStats {...({} as any)} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
