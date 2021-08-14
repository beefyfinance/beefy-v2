import React, { useState, useEffect } from 'react';
import ArrowGo from '@material-ui/icons/ArrowForwardIos';
import { Button, Grid, Hidden, makeStyles, Typography, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';

import AssetsImage from 'components/AssetsImage';
import SafetyScore from 'components/SafetyScore';
import DisplayTags from 'components/vaultTags';
import Popover from 'components/Popover';
import { calcDaily, formatApy, formatTvl } from 'helpers/format';
import styles from './styles';
import HistoricalRateChart from '../HistoricalRateChart/HistoricalRateChart';

const useStyles = makeStyles(styles);

const Item = ({ item, historicalApy }) => {
  const classes = useStyles();
  const history = useHistory();
  const [hasDeposit, setHasDeposit] = useState(false);
  const balances = useSelector(state => state.balanceReducer);
  const t = useTranslation().t;

  useEffect(() => {
    const mooBalance = BigNumber(balances.tokens[item.earnedToken].balance);
    if (!mooBalance.eq(0)) {
      setHasDeposit(true);
    } else {
      setHasDeposit(false);
    }
  }, [balances, item.earnedToken]);

  const itemClassNames = `${classes.itemContainer} ${hasDeposit ? 'hasDeposit' : ''}`;
  const apyContainerClassNames = `${classes.apyContainer} ${hasDeposit ? 'hasDeposit' : ''}`;

  return (
    <div className={itemClassNames}>
      <Grid container>
        <Grid className={classes.titleContainer} item xs={12} md={3}>
          <Box className={classes.infoContainer}>
            <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
            <Typography className={classes.vaultName}>{item.name}</Typography>
          </Box>
          <Box>
            <Box className={classes.badgesContainter}>
              <Box className={classes.badges}>
                <img
                  alt={item.network}
                  src={require('images/networks/' + item.network + '.svg').default}
                />
                <DisplayTags tags={item.tags} />
              </Box>
              <Box my={1}>
                <Button
                  onClick={() => history.push('/' + item.network + '/vault/' + item.id)}
                  className={classes.btnSeeDetails}
                >
                  See Details <ArrowGo style={{ fontSize: 12 }} />
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid className={classes.centerSpace} flexGrow={1} item xs={12} md={2} container>
          <Grid>
            <SafetyScore score={item.safetyScore} whiteLabel size="sm" />
            <Box display="flex" alignItems="center">
              <Typography className={classes.label}>{t('Safety-Score')}</Typography>
              <Box ml={0.5}>
                <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
              </Box>
            </Box>
          </Grid>
          <Grid>
            <Hidden mdUp>
              <Box className={classes.chart}>
                <HistoricalRateChart chartData={historicalApy} />
                <Typography className={classes.label}>{t('Vault-DailyHist')}</Typography>
              </Box>
            </Hidden>
          </Grid>
        </Grid>
        <Grid className={classes.centerSpace} item xs={12} md={3}>
          <Box>
            <Typography className={classes.value}>{formatTvl(item.tvl)}</Typography>
            <Typography className={classes.label}>{t('TVL')}</Typography>
          </Box>
          <Box>
            <Typography className={classes.value}>{calcDaily(item.apy.totalApy)}</Typography>
            <Typography className={classes.label}>{t('Vault-Daily')}</Typography>
          </Box>
        </Grid>
        <Grid className={classes.centerSpace} item xs={12} md={2}>
          <Hidden smDown>
            <Box className={classes.chart}>
              <HistoricalRateChart chartData={historicalApy} />
              <Typography className={classes.label}>{t('Vault-Chart')}</Typography>
            </Box>
          </Hidden>
        </Grid>
      </Grid>
      <div className={apyContainerClassNames}>
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
            {hasDeposit ? t('Deposit-Withdraw') : t('Deposit-Verb')}
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Item;
