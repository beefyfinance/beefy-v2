import React, { memo, useCallback, useMemo } from 'react';
import ArrowGo from '@material-ui/icons/ArrowForwardIos';
import { Button, Grid, Hidden, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AssetsImage from 'components/AssetsImage';
import SafetyScore from 'components/SafetyScore';
import DisplayTags from 'components/vaultTags';
import Popover from 'components/Popover';
import { calcDaily, formatApy, formatUsd } from 'helpers/format';
import styles from './styles';
import HistoricalRateChart from '../HistoricalRateChart/HistoricalRateChart';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

function Item({ id }) {
  const item = useSelector(state => state.vaultReducer.pools[id]);
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const earnedTokenBalance = useSelector(
    state => state.balanceReducer.tokens[item.network][item.earnedToken].balance
  );
  const hasDeposit = useMemo(
    () => earnedTokenBalance && earnedTokenBalance !== '0',
    [earnedTokenBalance]
  );
  const ctaText = useMemo(() => {
    if (hasDeposit) {
      if (item.status !== 'active') {
        return t('Withdraw');
      } else {
        return t('Deposit-Withdraw');
      }
    }
    return t('Deposit-Verb');
  }, [hasDeposit, item.status, t]);

  const formattedTVL = useMemo(() => formatUsd(item.tvl), [item.tvl]);
  const formattedAPY = useMemo(() => formatApy(item.apy.totalApy), [item.apy.totalApy]);
  const formattedDPY = useMemo(() => calcDaily(item.apy.totalApy), [item.apy.totalApy]);

  const handleOpenVault = useCallback(() => {
    history.push('/' + item.network + '/vault/' + item.id);
  }, [history, item.network, item.id]);

  const hasMore3Tags = item.tags.length > 2;

  return (
    <div
      className={clsx({
        [classes.itemContainer]: true,
        [classes.withHasDeposit]: hasDeposit,
        [classes.withMuted]: item.status === 'paused' || item.status === 'eol',
        [classes.withIsLongName]: item.name.length > 15,
      })}
    >
      <Grid container className={classes.dataGrid}>
        <Grid className={classes.titleContainer} item xs={12} md={4}>
          <div className={classes.infoContainer}>
            <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
            <Typography className={classes.vaultName}>{item.name}</Typography>
            {hasMore3Tags && (
              <div className={classes.networkIconHolder}>
                <img
                  alt={item.network}
                  src={require('images/networks/' + item.network + '.svg').default}
                />
              </div>
            )}
          </div>
          <div>
            <div className={classes.badgesContainter}>
              <div className={classes.badges}>
                {!hasMore3Tags && (
                  <img
                    alt={item.network}
                    src={require('images/networks/' + item.network + '.svg').default}
                  />
                )}
                <DisplayTags tags={item.tags} />
              </div>
              {hasMore3Tags ? (
                <Hidden smDown>
                  <div className={classes.seeDetailsHolder}>
                    <Button onClick={handleOpenVault} className={classes.btnSeeDetails}>
                      See Details <ArrowGo style={{ fontSize: 12 }} />
                    </Button>
                  </div>
                </Hidden>
              ) : (
                <div className={classes.seeDetailsHolder}>
                  <Button onClick={handleOpenVault} className={classes.btnSeeDetails}>
                    See Details <ArrowGo style={{ fontSize: 12 }} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Grid>
        <Grid className={classes.centerSpace} item xs={12} md={2}>
          <div className={classes.stat}>
            <SafetyScore score={item.safetyScore} whiteLabel size="sm" />
            <div className={classes.safetyLabel}>
              <Typography className={classes.label}>{t('Safety-Score')}</Typography>
              <div className={classes.safetyScoreExplainerHolder}>
                <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
              </div>
            </div>
          </div>
          <div className={classes.stat}>
            <Hidden mdUp>
              <div className={classes.chart}>
                <HistoricalRateChart id={id} />
                <Typography className={classes.label}>{t('Vault-Chart')}</Typography>
              </div>
            </Hidden>
          </div>
        </Grid>
        <Grid className={classes.centerSpace} item xs={12} md={4}>
          <div className={classes.stat}>
            <Typography className={classes.value}>{formattedTVL}</Typography>
            <Typography className={classes.label}>{t('TVL')}</Typography>
          </div>
          <div className={classes.stat}>
            <Typography className={classes.value}>{formattedDPY}</Typography>
            <Typography className={classes.label}>{t('Vault-Daily')}</Typography>
          </div>
        </Grid>
        <Grid className={classes.centerSpace} item xs={12} md={2}>
          <Hidden smDown>
            <div className={classes.chart}>
              <HistoricalRateChart id={id} />
              <Typography className={classes.label}>{t('Vault-Chart')}</Typography>
            </div>
          </Hidden>
          <Hidden mdUp>
            {hasMore3Tags && (
              <Button onClick={handleOpenVault} className={classes.btnSeeDetails}>
                See Details <ArrowGo style={{ fontSize: 12 }} />
              </Button>
            )}
          </Hidden>
        </Grid>
      </Grid>
      <div className={classes.apyContainer}>
        <div className={classes.apyHolder}>
          <Typography variant={'h1'}>{formattedAPY}</Typography>
          <Typography variant={'h2'}>{t('APY')}</Typography>
        </div>
        <div>
          <Button onClick={handleOpenVault} size="large" className={classes.depositButton}>
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(Item);
