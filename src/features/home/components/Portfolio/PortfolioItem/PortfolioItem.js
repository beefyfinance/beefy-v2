import { makeStyles, Grid, Button, Hidden, Typography, Box } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import HistoricalRateChart from '../../HistoricalRateChart/HistoricalRateChart';
import { formatApy, formatDecimals } from 'helpers/format';
import DisplayTags from 'components/vaultTags';
import Popover from 'components/Popover';
import vaultStates from './vaultStates.json';
import { useSelector } from 'react-redux';
import styles from './styles';

const useStyles = makeStyles(styles);

const PortfolioItem = ({ item, historicalApy }) => {
  const classes = useStyles({
    muted: item.status === 'paused' || item.status === 'eol',
  });
  const history = useHistory();
  const t = useTranslation().t;
  const balance = useSelector(state => state.balanceReducer);

  const formatBalance = () => {
    let vaultBalance = new BigNumber(balance.tokens[item.earnedToken].balance);
    vaultBalance = vaultBalance.times(item.pricePerFullShare).div('1e18').div('1e18');
    return formatDecimals(vaultBalance, 4, 6);
  };

  const formatBalanceInUsd = () => {
    let vaultBalance = new BigNumber(balance.tokens[item.earnedToken].balance);
    vaultBalance = vaultBalance.times(item.pricePerFullShare).div('1e18').div('1e18');
    return vaultBalance.times(item.oraclePrice).toFixed(2);
  };

  const ctaText = () => (item.depositsPaused === true ? t('Withdraw-Verb') : t('Deposit-Withdraw'));

  const stateTag = () => {
    if (item.depositsPaused) {
      if (item.status === 'active') {
        return ['depositsPaused'];
      } else if (item.status === 'paused') {
        return ['paused'];
      } else if (item.status === 'eol') {
        return ['eol'];
      }
    } else {
      return [];
    }
  };

  return (
    <Grid
      container
      key={item.id}
      className={[classes.item, classes.roundedLeft, classes.roundedRight].join(' ')}
    >
      <Box flexGrow={1} textAlign="left">
        <Grid container>
          <Grid>
            <Box className={classes.title} textAlign={'left'}>
              <Typography className={classes.vaultName}>{item.name}</Typography>
              <Box display="flex" alignItems="center">
                <Typography display={'inline'}>
                  <img
                    alt={item.network}
                    src={require('images/networks/' + item.network + '.svg').default}
                  />
                </Typography>
                <Box marginRight={0.5}>
                  <DisplayTags tags={stateTag()} />
                </Box>
                {item.depositsPaused && (
                  <Popover
                    title={t(vaultStates[item.status].title)}
                    content={t(vaultStates[item.status].description)}
                    placement="top-start"
                    solid
                  />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.rWidth} textAlign={'left'}>
        <Typography className={classes.h2}>
          {formatBalance()} {item.oracle === 'tokens' ? item.token : 'LP'}
        </Typography>
        <Typography className={classes.h3}>
          <span className={classes.bold}>${formatBalanceInUsd()}</span> {t('PortfolioItem-Balance')}
        </Typography>
      </Box>
      <Hidden smDown>
        <Box className={[classes.rWidth, classes.chart].join(' ')} textAlign={'center'}>
          <HistoricalRateChart chartData={historicalApy} />
          <Typography className={classes.h3}>{t('Vault-Chart')}</Typography>
        </Box>
      </Hidden>
      <Box className={classes.apyContainer}>
        <Box display="flex" justifyContent="center" alignItems="center">
          {item.status === 'paused' || item.status === 'eol' ? (
            <Typography variant="h1">0%</Typography>
          ) : (
            <Typography variant="h1">{formatApy(item.apy.totalApy)}</Typography>
          )}
          <Box marginLeft={1}>
            <Typography variant="h2">{t('APY')}</Typography>
          </Box>
        </Box>
        <Box>
          <Button
            className={classes.cta}
            onClick={() => {
              history.push('/' + item.network + '/vault/' + item.id);
            }}
          >
            {ctaText()}
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

export default PortfolioItem;
