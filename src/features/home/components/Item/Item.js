import React, { memo, useCallback, useMemo, useState } from 'react';
import { Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AssetsImage from 'components/AssetsImage';
import SafetyScore from 'components/SafetyScore';
import DisplayTags from 'components/vaultTags';
import Popover from 'components/Popover';
import BigNumber from 'bignumber.js';
import { isEmpty } from 'helpers/utils';
import ApyLoader from 'components/APYLoader';
import { byDecimals, calcDaily, formatApy, formatUsd } from 'helpers/format';
import styles from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

function Item({ vault }) {
  const item = vault;

  const [isBoosted, setIsBoosted] = React.useState(false);

  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const { wallet, balance } = useSelector(state => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const pricesReducer = useSelector(state => state.pricesReducer);

  const [state, setState] = React.useState({ formattedBalance: 0 });
  const [priceInDolar, setPriceInDolar] = React.useState({ balance: 0 });

  const formattedTVL = useMemo(() => formatUsd(item.tvl), [item.tvl]);
  const formattedAPY = useMemo(() => formatApy(item.apy.totalApy), [item.apy.totalApy]);
  const formattedDPY = useMemo(() => calcDaily(item.apy.totalApy), [item.apy.totalApy]);

  const handleOpenVault = useCallback(() => {
    history.push(`/${item.network}/vault/${item.id}`);
  }, [history, item.network, item.id]);

  const hasMore3Tags = item.tags.length > 2;

  React.useEffect(() => {
    let amount = 0;
    if (wallet.address && !isEmpty(balance.tokens[item.network][item.earnedToken])) {
      amount = byDecimals(
        new BigNumber(balance.tokens[item.network][item.earnedToken].balance).multipliedBy(
          byDecimals(item.pricePerFullShare)
        ),
        item.tokenDecimals
      ).toFixed(8);
    }
    setPriceInDolar({ balance: amount });
  }, [wallet.address, item, balance]);

  React.useEffect(() => {
    let amount = 0;
    if (wallet.address) {
      amount = byDecimals(item.balance, item.tokenDecimals)
        .multipliedBy(byDecimals(item.pricePerFullShare))
        .toFixed(8);
    }
    setState({ formattedBalance: amount });
  }, [
    wallet.address,
    item.balance,
    balance.isBalancesLoading,
    item.tokenDecimals,
    item.pricePerFullShare,
  ]);

  const ValueText = ({ value }) => (
    <>{value ? <span className={classes.value}>{value}</span> : <ApyLoader />}</>
  );

  const ValuePrice = ({ value }) => (
    <>{value ? <span className={classes.price}>{value}</span> : <ApyLoader />}</>
  );

  const price = React.useMemo(() => {
    return priceInDolar.balance > 0
      ? BigNumber(pricesReducer.prices[item.oracleId]).times(priceInDolar.balance).toFixed(2)
      : 0;
  }, [priceInDolar.balance, pricesReducer.prices, item.oracleId]);

  const tokensEarned = React.useMemo(() => {
    return state.formattedBalance > 0 ? state.formattedBalance : '0';
  }, [state.formattedBalance]);

  return (
    <div
      className={clsx({
        [classes.itemContainer]: true,
        [classes.withHasDeposit]: item.balance > 0,
        [classes.withMuted]: item.status === 'paused' || item.status === 'eol',
        [classes.withIsLongName]: item.name.length > 12,
        [classes.withBoosted]: isBoosted,
      })}
    >
      <Grid container className={classes.dataGrid}>
        {/*Title*/}
        <div className={classes.titleContainer}>
          <Grid container>
            <Grid
              item
              onClick={handleOpenVault}
              className={classes.infoContainer}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            >
              {/*Vault Image*/}
              <AssetsImage img={item.logo} assets={item.assets} alt={item.name} size={'60px'} />
            </Grid>
            <Grid item>
              <div>
                <div className={classes.infoContainer}>
                  {/*Vault Name*/}
                  <Typography className={classes.vaultName} onClick={handleOpenVault}>
                    {item.name}
                  </Typography>
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
              <span className={classes.platformContainer}>
                <Typography className={classes.platformLabel}>{t('PLATFORM')}:&nbsp;</Typography>
                <Typography className={classes.platformValue}>{item.platform}</Typography>
              </span>
            </Grid>
          </Grid>
        </div>
        <div className={classes.statsContainer}>
          <Grid container>
            {/*DEPOSIT*/}
            <div className={classes.centerSpace}>
              <div className={classes.stat}>
                <Typography className={classes.label}>{t('DEPOSITED')}</Typography>
                <Typography>
                  <ValueText value={tokensEarned} />
                </Typography>
                {priceInDolar.balance > 0 && (
                  <Typography>
                    <ValuePrice value={formatUsd(price)} />
                  </Typography>
                )}
                {isBoosted && priceInDolar.balance == 0 ? (
                  <div className={classes.boostSpacer} />
                ) : null}
              </div>
            </div>
            {/*TVL*/}
            <div className={classes.centerSpace}>
              <div className={classes.stat}>
                <Typography className={classes.label}>{t('TVL')}</Typography>
                <Typography className={classes.value}>{formattedTVL}</Typography>
                {isBoosted ? <div className={classes.boostSpacer} /> : null}
              </div>
            </div>
            {/*APY*/}
            <div className={classes.centerSpace}>
              <div className={classes.stat}>
                <div className={classes.tooltipLabel}>
                  <Typography className={classes.label}>{t('APY')}</Typography>
                  <div className={classes.tooltipHolder}>
                    <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
                  </div>
                </div>
                <Typography className={classes.value}>{formattedAPY}</Typography>
                {isBoosted ? (
                  <Typography className={classes.valueStrikethrough}>{formattedAPY}</Typography>
                ) : null}
              </div>
            </div>
            {/*Daily*/}
            <div className={classes.centerSpace}>
              <div className={classes.stat}>
                <div className={classes.tooltipLabel}>
                  <Typography className={classes.label}>{t('Vault-Daily')}</Typography>
                  <div className={classes.tooltipHolder}>
                    <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
                  </div>
                </div>
                <Typography className={classes.value}>{formattedDPY}</Typography>
                {isBoosted ? (
                  <Typography className={classes.valueStrikethrough}>{formattedDPY}</Typography>
                ) : null}
              </div>
            </div>
            {/*Saftey Score*/}
            <div className={classes.centerSpace}>
              <div className={classes.stat}>
                <div className={classes.tooltipLabel}>
                  <Typography className={classes.safetyLabel}>{t('Safety-Score')}</Typography>
                  <div className={classes.tooltipHolder}>
                    <Popover solid title={t('Safety-ScoreWhat')} content={t('Safety-ScoreExpl')} />
                  </div>
                </div>
                <SafetyScore score={item.safetyScore} whiteLabel size="sm" />
                {isBoosted ? <div className={classes.boostSpacerSm} /> : null}
              </div>
            </div>
            {/*Open Vault*/}
            <div className={classes.centerSpaceOpen} style={{ padding: 0 }}>
              <Button onClick={handleOpenVault} size="large" className={classes.depositButton}>
                {t('Vault-Open')}
              </Button>
            </div>
          </Grid>
        </div>
      </Grid>
    </div>
  );
}

export default memo(Item);
