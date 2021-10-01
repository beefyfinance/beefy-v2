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
  console.log(item);
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const earnedTokenBalance = useSelector(
    state => state.balanceReducer.tokens[item.earnedToken].balance
  );
  const hasDeposit = useMemo(
    () => earnedTokenBalance && earnedTokenBalance !== '0',
    [earnedTokenBalance]
  );

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
        {/*Title*/}
        <Grid className={classes.titleContainer} item xs={12} md={3}>
          <Grid container>
            <Grid item className={classes.infoContainer} style={{ marginRight: '8px' }}>
              {/*Vault Image*/}
              <AssetsImage img={item.logo} assets={item.assets} alt={item.name} size={'60px'} />
            </Grid>
            <Grid item>
              <div>
                <div className={classes.infoContainer}>
                  {/*Vault Name*/}
                  <Typography className={classes.vaultName}>{item.name}</Typography>
                  {/*Network Image*/}
                  {hasMore3Tags && (
                    <div className={classes.networkIconHolder}>
                      <img
                        alt={item.network}
                        src={require('images/networks/' + item.network + '.svg').default}
                      />
                    </div>
                  )}
                </div>
                {/*Vault Tags*/}
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
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container>
            {/*DEPOSIT*/}
            <Grid className={classes.centerSpace} item xs={6} md={2}>
              <div className={classes.stat}>
                <Typography className={classes.label}>{t('DEPOSITED')}</Typography>
                <Typography className={classes.value}>{earnedTokenBalance}</Typography>
              </div>
            </Grid>
            {/*TVL*/}
            <Grid className={classes.centerSpace} item xs={6} md={2}>
              <div className={classes.stat}>
                <Typography className={classes.label}>{t('TVL')}</Typography>
                <Typography className={classes.value}>{formattedTVL}</Typography>
              </div>
            </Grid>
            {/*APY*/}
            <Grid className={classes.centerSpace} item xs={6} md={2}>
              <div className={classes.stat}>
                <div className={classes.tooltipLabel}>
                  <Typography className={classes.label}>{t('APY')}</Typography>
                  <div className={classes.tooltipHolder}>
                    <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
                  </div>
                </div>
                <Typography className={classes.value}>{formattedAPY}</Typography>
              </div>
            </Grid>
            {/*Daily*/}
            <Grid className={classes.centerSpace} item xs={6} md={2}>
              <div className={classes.stat}>
                <div className={classes.tooltipLabel}>
                  <Typography className={classes.label}>{t('Vault-Daily')}</Typography>
                  <div className={classes.tooltipHolder}>
                    <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
                  </div>
                </div>
                <Typography className={classes.value}>{formattedDPY}</Typography>
              </div>
            </Grid>
            {/* {<Grid className={classes.centerSpace} item xs={12} md={2}>
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
        </Grid>} */}
            {/*Saftey Score*/}
            <Grid className={classes.centerSpace} item xs={6} md={2}>
              <div className={classes.stat}>
                <div className={classes.tooltipLabel}>
                  <Typography className={classes.label}>{t('Safety-Score')}</Typography>
                  <div className={classes.tooltipHolder}>
                    <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
                  </div>
                </div>
                <SafetyScore score={item.safetyScore} whiteLabel size="sm" />
              </div>
            </Grid>
            {/*Open Vault*/}
            <Grid className={classes.centerSpace} style={{ padding: 0 }} item xs={12} md={2}>
              <Button onClick={handleOpenVault} size="large" className={classes.depositButton}>
                {t('Vault-Open')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default memo(Item);
