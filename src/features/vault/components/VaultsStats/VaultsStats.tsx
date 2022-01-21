import React from 'react';
import { Box, makeStyles, Typography, Divider, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ApyStatLoader } from '../../../../components/ApyStatLoader';
import { useSelector } from 'react-redux';
import { calcDaily, formatApy, formatUsd, byDecimals } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import BigNumber from 'bignumber.js';
import { styles } from './styles';
import { useLastHarvest } from '../../hooks/useLastHarvest';

const useStyles = makeStyles(styles as any);
function VaultsStatsComponent({ item, boostedData, isBoosted, vaultBoosts }) {
  const pricesReducer = useSelector((state: any) => state.pricesReducer);
  const lastHarvest = useLastHarvest(item.id);
  const classes = useStyles();
  const t = useTranslation().t;
  const [deposited, setDeposited] = React.useState({
    balance: new BigNumber(0),
    shares: new BigNumber(0),
  });
  const [poolRewards, setPoolRewards] = React.useState({
    balance: new BigNumber(0),
    shares: new BigNumber(0),
  });
  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));

  React.useEffect(() => {
    let symbol = item.isGovVault ? `${item.token}GovVault` : item.earnedToken;

    let balanceSingle = new BigNumber(0);
    let rewardsBalance = new BigNumber(0);
    let sharesBalance = new BigNumber(0);
    let rewardsSharesBalance = new BigNumber(0);

    if (wallet.address && !isEmpty(balance.tokens[item.network][symbol])) {
      if (item.isGovVault) {
        balanceSingle = byDecimals(
          balance.tokens[item.network][symbol].balance,
          item.tokenDecimals
        );
        rewardsBalance = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].rewards),
          item.tokenDecimals
        );
        sharesBalance = new BigNumber(balance.tokens[item.network][symbol].balance);
        rewardsSharesBalance = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].rewards)
        );
      } else {
        balanceSingle = byDecimals(
          new BigNumber(balance.tokens[item.network][item.earnedToken].balance)
            .multipliedBy(byDecimals(item.pricePerFullShare))
            .toFixed(8),
          item.tokenDecimals
        );
        sharesBalance = new BigNumber(balance.tokens[item.network][symbol].balance);
      }
      if (item.isBoosted) {
        const boost = item.boostData;
        let symbol = `${boost.token}${boost.id}Boost`;
        if (!isEmpty(balance.tokens[item.network][symbol])) {
          balanceSingle = byDecimals(
            new BigNumber(balance.tokens[item.network][symbol].balance).multipliedBy(
              byDecimals(item.pricePerFullShare)
            ),
            item.tokenDecimals
          );
          sharesBalance = new BigNumber(balance.tokens[item.network][symbol].balance);
        }
      }
    }
    setDeposited({ balance: balanceSingle, shares: sharesBalance });
    setPoolRewards({ balance: rewardsBalance, shares: rewardsSharesBalance });
  }, [wallet.address, item, balance, vaultBoosts]);

  const ValueText = ({ value }) => (
    <>
      {value ? (
        <Typography variant="h4" className={classes.value}>
          {value}
        </Typography>
      ) : (
        <ApyStatLoader />
      )}
    </>
  );

  const ValueTached = ({ value }) => (
    <>{value ? <span className={classes.tached}>{value}</span> : <ApyStatLoader />}</>
  );

  const ValuePrice = ({ value }) => (
    <>{value ? <Typography className={classes.price}>{value}</Typography> : <ApyStatLoader />}</>
  );

  const yearlyToDaily = apy => {
    const g = Math.pow(10, Math.log10(apy + 1) / 365) - 1;

    if (isNaN(g)) {
      return 0;
    }

    return g;
  };

  const values: Record<string, any> = {};

  values.totalApy = item.apy.totalApy;

  if (item.apy.vaultApr) {
    values.vaultApr = item.apy.vaultApr;
    values.vaultDaily = item.apy.vaultApr / 365;
  }

  if (item.apy.tradingApr) {
    values.tradingApr = item.apy.tradingApr;
    values.tradingDaily = item.apy.tradingApr / 365;
  }

  if (values.vaultDaily || values.tradingDaily) {
    values.totalDaily = (values.vaultDaily || 0) + (values.tradingDaily || 0);
  } else {
    values.totalDaily = yearlyToDaily(values.totalApy);
  }

  if (item.isGovVault) {
    values.totalApy = values.vaultApr / 1;
    values.totalDaily = values.vaultApr / 365;
  }

  if (isBoosted) {
    values.boostApr = boostedData.apr;
    values.boostDaily = boostedData.apr / 365;
    values.boostedTotalApy = values.boostApr ? values.totalApy + values.boostApr : 0;
    values.boostedTotalDaily = values.boostDaily ? values.totalDaily + values.boostDaily : 0;
  }

  const formatted = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatApy(value, 4)
        : formatApy(value);
      return [key, formattedValue];
    })
  );

  const _deposited = deposited.balance.isGreaterThan(0)
    ? deposited.balance.toFixed(8)
    : new BigNumber(0).toFixed(2);

  const depositedUsd = deposited.balance.isGreaterThan(0)
    ? formatUsd(deposited.balance, pricesReducer.prices[item.oracleId])
    : formatUsd(0);

  const rewardsEarned = poolRewards.balance.isGreaterThan(0)
    ? poolRewards.shares
    : new BigNumber(0);

  const rewardPrice = poolRewards.balance.isGreaterThan(0)
    ? formatUsd(poolRewards.balance, pricesReducer.prices[item.earnedToken])
    : formatUsd(0);

  const formatDecimals = number => {
    return number.isGreaterThanOrEqualTo(0)
      ? number.toFixed(4)
      : number.isEqualTo(0)
      ? 0
      : number.toFixed(8);
  };

  return (
    <>
      {item && (
        <Box className={classes.container}>
          <Grid spacing={6} container>
            <Grid item lg={8} xs={12}>
              <Box className={classes.stats}>
                {/**TVL */}
                <Box width={'33%'}>
                  <Typography className={classes.label}>{t('TVL')}</Typography>
                  <Typography>
                    <ValueText value={item ? formatUsd(item.tvl.toNumber()) : formatUsd(0)} />
                  </Typography>
                </Box>
                {/*APY-APR */}
                <Box className={classes.stat}>
                  <Divider className={classes.divider} orientation="vertical" />
                  <Box>
                    <Typography className={classes.label}>
                      {!item.isGovVault ? t('APY') : t('APR')}
                    </Typography>
                    {isBoosted ? (
                      <>
                        {' '}
                        <Typography>
                          <ValueText value={formatted.boostedTotalApy} />
                        </Typography>
                        <Typography>
                          <ValueTached value={formatApy(item.apy.totalApy)} />
                        </Typography>{' '}
                      </>
                    ) : (
                      <>
                        <Typography>
                          <ValueText
                            value={
                              item.isGovVault
                                ? formatApy(values.totalApy)
                                : formatApy(item.apy.totalApy)
                            }
                          />
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                {/* DAILY */}
                <Box display="flex">
                  <Divider className={classes.divider} orientation="vertical" />
                  <Box>
                    <Typography className={classes.label}>{t('Vault-Daily')}</Typography>
                    {isBoosted ? (
                      <>
                        <Typography>
                          <ValueText value={formatted.boostedTotalDaily} />
                        </Typography>
                        <Typography>
                          <ValueTached value={item ? calcDaily(item.apy.totalApy) : 0} />
                        </Typography>
                      </>
                    ) : (
                      <Typography>
                        <ValueText
                          value={
                            item.isGovVault
                              ? formatApy(values.totalDaily)
                              : calcDaily(item.apy.totalApy)
                          }
                        />
                        {/* <ValueText value={item ? calcDaily(item.apy.totalApy) : 0} /> */}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item lg={4} xs={12}>
              <Grid container className={classes.stats2}>
                <Grid item xs={6} className={classes.stat1}>
                  <Box>
                    <Typography className={classes.label}>{t('Vault-deposited')}</Typography>
                    <Typography>
                      <ValueText value={_deposited} />
                    </Typography>
                    {deposited.balance.isGreaterThan(0) && (
                      <Typography>
                        <ValuePrice value={depositedUsd} />
                      </Typography>
                    )}
                  </Box>
                </Grid>
                {(item.isGovVault || lastHarvest !== 'never') && (
                  <Divider flexItem={true} className={classes.divider1} orientation="vertical" />
                )}
                {!item.isGovVault ? (
                  <>
                    {lastHarvest !== 'never' && (
                      <Grid item xs={6}>
                        <Box>
                          <Typography className={classes.label}>
                            {t('Vault-LastHarvest')}
                          </Typography>
                          <Typography>
                            <ValueText value={lastHarvest} />
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </>
                ) : (
                  <Grid item xs={6}>
                    <Box>
                      <Typography className={classes.label}>{t('Vault-rewards')}</Typography>
                      <Typography>
                        <ValueText value={formatDecimals(rewardsEarned)} />
                      </Typography>
                      {deposited.balance.isGreaterThan(0) && (
                        <Typography>
                          <ValuePrice value={rewardPrice} />
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
}

export const VaultsStats = React.memo(VaultsStatsComponent);
