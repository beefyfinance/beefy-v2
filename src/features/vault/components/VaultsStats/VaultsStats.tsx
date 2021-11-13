import React from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ApyStatLoader } from '../../../../components/ApyStatLoader';
import { useSelector } from 'react-redux';
import { calcDaily, formatApy, formatUsd, byDecimals } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import BigNumber from 'bignumber.js';
import { styles } from './styles';
import { useLastHarvest } from '../../hooks/useLastHarvest';

const useStyles = makeStyles(styles as any);
export const VaultsStats = ({ item, boostedData, isBoosted, vaultBoosts }) => {
  const pricesReducer = useSelector((state: any) => state.pricesReducer);
  const classes = useStyles();
  const t = useTranslation().t;
  const [state, setState] = React.useState({ balance: '0' });
  const [poolRewards, setPoolRewards] = React.useState({ rewards: '0' });

  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));

  React.useEffect(() => {
    let amount = '0';
    let rewardAmount = '0';
    let symbol = item.isGovVault ? `${item.token}GovVault` : item.earnedToken;
    if (wallet.address && !isEmpty(balance.tokens[item.network][symbol])) {
      let sumAmount = new BigNumber(0);
      if (item.isGovVault) {
        sumAmount = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].balance),
          item.tokenDecimals
        )
        rewardAmount = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].rewards),
          item.tokenDecimals
        ).toFixed(8);
      } else {
        sumAmount = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].balance).multipliedBy(
            byDecimals(item.pricePerFullShare)
          ),
          item.tokenDecimals
        )
      }
      for (const boost of vaultBoosts) {
        let symbol = `${boost.token}${boost.id}Boost`;
        if (!isEmpty(balance.tokens[item.network][symbol])) {
          sumAmount = sumAmount.plus(
            byDecimals(
              new BigNumber(balance.tokens[item.network][symbol].balance).multipliedBy(
                byDecimals(item.pricePerFullShare)
              ),
              item.tokenDecimals
            )
          );
        }
      }
      amount = sumAmount.toFixed(8);
    }
    setState({ balance: amount });
    if (!isNaN(parseFloat(rewardAmount))) setPoolRewards({ rewards: rewardAmount });
  }, [wallet.address, item, balance, vaultBoosts]);

  const lastHarvest = useLastHarvest(item.id);

  const ValueText = ({ value }) => (
    <>{value ? <span className={classes.value}>{value}</span> : <ApyStatLoader />}</>
  );

  const ValueTached = ({ value }) => (
    <>{value ? <span className={classes.tached}>{value}</span> : <ApyStatLoader />}</>
  );

  const ValuePrice = ({ value }) => (
    <>{value ? <span className={classes.price}>{value}</span> : <ApyStatLoader />}</>
  );

  const price = React.useMemo(() => {
    return parseFloat(state.balance) > 0
      ? new BigNumber(pricesReducer.prices[item.oracleId]).times(state.balance).toFixed(2)
      : 0;
  }, [state.balance, pricesReducer.prices, item.oracleId]);

  const rewardPrice = React.useMemo(() => {
    return parseFloat(poolRewards.rewards) > 0
      ? new BigNumber(pricesReducer.prices[item.earnedToken])
          .times(parseFloat(poolRewards.rewards))
          .toFixed(2)
      : 0;
  }, [poolRewards.rewards, pricesReducer.prices, item.oracleId]);

  const tokensEarned = React.useMemo(() => {
    return parseFloat(state.balance) > 0 ? state.balance : '0';
  }, [state.balance]);

  const rewardsEarned = React.useMemo(() => {
    return parseFloat(poolRewards.rewards) > 0 ? poolRewards.rewards : '0';
  }, [poolRewards.rewards]);

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
        ? formatApy(value /*, 4*/) // TODO: fix this formatApy
        : formatApy(value);
      return [key, formattedValue];
    })
  );

  return (
    <Box className={classes.container}>
      <Box sx={{ flexGrow: 1 }} className={classes.stats}>
        <Box className={classes.stat}>
          <Typography className={classes.label}>{t('TVL')}</Typography>
          <Typography>
            <ValueText value={item ? formatUsd(item.tvl) : 0} />
          </Typography>
        </Box>
        <Box className={classes.stat}>
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
                    item.isGovVault ? formatApy(values.totalApy) : formatApy(item.apy.totalApy)
                  }
                />
              </Typography>
            </>
          )}
        </Box>
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
                  item.isGovVault ? formatApy(values.totalDaily) : calcDaily(item.apy.totalApy)
                }
              />
              {/* <ValueText value={item ? calcDaily(item.apy.totalApy) : 0} /> */}
            </Typography>
          )}
        </Box>
      </Box>
      <Box className={classes.stats2}>
        <Box className={classes.stat}>
          <Typography className={classes.label}>{t('Vault-deposited')}</Typography>
          <Typography>
            <ValueText value={tokensEarned} />
          </Typography>
          {parseFloat(state.balance) > 0 && (
            <Typography>
              <ValuePrice value={formatUsd(price)} />
            </Typography>
          )}
        </Box>
        {!item.isGovVault ? (
          <Box className={classes.stat}>
            <Typography className={classes.label}>{t('Vault-LastHarvest')}</Typography>
            <Typography>
              <ValueText value={lastHarvest} />
            </Typography>
          </Box>
        ) : (
          <Box className={classes.stat}>
            <Typography className={classes.label}>{t('Vault-rewards')}</Typography>
            <Typography>
              <ValueText value={rewardsEarned} />
            </Typography>
            {parseFloat(state.balance) > 0 && (
              <Typography>
                <ValuePrice value={formatUsd(rewardPrice)} />
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
