import React from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ApyLoader } from '../../../../components/ApyLoader';
import { useSelector } from 'react-redux';
import { calcDaily, formatApy, formatUsd, byDecimals } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import BigNumber from 'bignumber.js';
import { styles } from './styles';
import { useLastHarvest } from '../../hooks/useLastHarvest';

const useStyles = makeStyles(styles as any);
export const VaultsStats = ({ item }) => {
  const pricesReducer = useSelector(state => state.pricesReducer);
  const classes = useStyles();
  const t = useTranslation().t;
  const [state, setState] = React.useState({ balance: 0 });

  const { wallet, balance } = useSelector(state => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));

  let boosted = false;

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
    setState({ balance: amount });
  }, [wallet.address, item, balance]);

  const lastHarvest = useLastHarvest(item.id);

  const ValueText = ({ value }) => (
    <>{value ? <span className={classes.value}>{value}</span> : <ApyLoader />}</>
  );

  const ValueTached = ({ value }) => (
    <>{value ? <span className={classes.tached}>{value}</span> : <ApyLoader />}</>
  );

  const ValuePrice = ({ value }) => (
    <>{value ? <span className={classes.price}>{value}</span> : <ApyLoader />}</>
  );

  const price = React.useMemo(() => {
    return state.balance > 0
      ? new BigNumber(pricesReducer.prices[item.oracleId]).times(state.balance).toFixed(2)
      : 0;
  }, [state.balance, pricesReducer.prices, item.oracleId]);

  const tokensEarned = React.useMemo(() => {
    return state.balance > 0 ? state.balance : '0';
  }, [state.balance]);

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
          <Typography className={classes.label}>{t('APY')}</Typography>
          {boosted ? (
            <>
              {' '}
              <Typography>
                <ValueText value={formatApy(item.apy.totalApy)} />
              </Typography>
              <Typography>
                <ValueTached value={formatApy(item.apy.totalApy)} />
              </Typography>{' '}
            </>
          ) : (
            <>
              <Typography>
                <ValueText value={formatApy(item.apy.totalApy)} />
              </Typography>
            </>
          )}
        </Box>
        <Box>
          <Typography className={classes.label}>{t('Vault-Daily')}</Typography>
          {boosted ? (
            <>
              <Typography>
                <ValueText value={item ? calcDaily(item.apy.totalApy) : 0} />
              </Typography>
              <Typography>
                <ValueTached value={item ? calcDaily(item.apy.totalApy) : 0} />
              </Typography>
            </>
          ) : (
            <Typography>
              <ValueText value={item ? calcDaily(item.apy.totalApy) : 0} />
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
          {state.balance > 0 && (
            <Typography>
              <ValuePrice value={formatUsd(price)} />
            </Typography>
          )}
        </Box>
        <Box className={classes.stat}>
          <Typography className={classes.label}>{t('Vault-LastHarvest')}</Typography>
          <Typography>
            <ValueText value={lastHarvest} />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
