import React, { useState, useEffect } from 'react';
import { Button, Grid, Hidden, makeStyles, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';

import AssetsImage from 'components/AssetsImage';
import SafetyScore from 'components/SafetyScore';
import DisplayTags from 'components/vaultTags';
import Popover from 'components/Popover';
import { calcDaily, formatApy, formatTvl, formatDecimals } from 'helpers/format';
import styles from './styles';
import HistoricalRateChart from '../HistoricalRateChart/HistoricalRateChart';

const useStyles = makeStyles(styles);

const Item = ({ item, historicalApy }) => {
  const classes = useStyles();
  const history = useHistory();
  const [hasDeposit, setHasDeposit] = useState(false);
  const t = useTranslation().t;

  useEffect(() => {
    if (item.balance !== 0) {
      setHasDeposit(true);
    } else {
      setHasDeposit(false);
    }
  }, [item]);

  const itemClassNames = `${classes.itemContainer} ${hasDeposit ? 'hasDeposit' : ''}`;
  const apyContainerClassNames = `${classes.apyContainer} ${classes.rWidth} ${
    hasDeposit ? 'hasDeposit' : ''
  }`;

  console.log(itemClassNames);
  return (
    <Grid container key={item.id}>
      <Box className={itemClassNames}>
        <Grid container>
          <Grid className={classes.titleContainer} item xs={12} md={3}>
            <Box className={classes.infoContainer}>
              <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
            </Box>
            <Box>
              <Typography className={classes.vaultName}>{item.name}</Typography>
              <Hidden smDown>
                <Box className={classes.badges}>
                  <img
                    alt={item.network}
                    src={require('images/networks/' + item.network + '.svg').default}
                  />
                  <DisplayTags tags={item.tags} />
                </Box>
              </Hidden>
            </Box>
          </Grid>
          <Grid className={classes.center} flexGrow={1} item xs={12} md={2}>
            <Box textAlign={'center'}>
              <SafetyScore score={item.safetyScore} whiteLabel size="sm" />
              <Box display="flex" alignItems="center">
                <Typography className={classes.label}>{t('Vault-SftyScore')}</Typography>
                <Box ml={0.5}>
                  <Popover
                    solid
                    title="What's the Safety Score?"
                    content="The Safety Score is computed by the Beefy devs when assesing each vault. It is not necessarily perfect, but it is another tool that can help make a decision. The safety score that a vault can get goes from 1 to 10. The best possible score is 10 and the worst is 0"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid className={classes.centerSpace} item xs={12} md={3}>
            <Box>
              <Typography className={classes.value}>{formatTvl(item.tvl)}</Typography>
              <Typography className={classes.label}>{t('TVL')}</Typography>
            </Box>
            <Box textAlign={'center'}>
              <Typography className={classes.value}>{calcDaily(item.apy.totalApy)}</Typography>
              <Typography className={classes.label}>{t('Vault-Daily')}</Typography>
            </Box>
          </Grid>

          <Grid className={classes.centerSpace} item xs={12} md={2}>
            <Hidden mdUp>
              <Box className={classes.badges}>
                <img
                  alt={item.network}
                  src={require('images/networks/' + item.network + '.svg').default}
                />
                <DisplayTags tags={item.tags} />
              </Box>
            </Hidden>
            <Box className={classes.chart}>
              <HistoricalRateChart chartData={historicalApy} />
              <Typography className={classes.label}>{t('Vault-DailyHist')}</Typography>
            </Box>
          </Grid>
          <Grid className={apyContainerClassNames} item xs={12} md={2}>
            <Box textAlign={'center'}>
              <Typography variant={'h1'}>{formatApy(item.apy.totalApy)}</Typography>
              <Typography variant={'h2'}>{t('APY')}</Typography>
            </Box>
            <Box className={classes.center}>
              <Button
                onClick={() => history.push('/' + item.network + '/vault/' + item.id)}
                size="large"
                className={classes.depositButton}
              >
                {t('Deposit-Verb')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

export default Item;
