import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Container, makeStyles } from '@material-ui/core';
import reduxActions from '../redux/actions';
import Filter from 'features/home/components/Filter';
import Portfolio from 'features/home/components/Portfolio';
import Item from 'features/home/components/Item';
import Loader from 'components/CowLoader';
import { formatUsd } from 'helpers/format';
import ApyLoader from 'components/APYLoader';
import useVaults from './hooks/useFilteredVaults';
import styles from './styles';
import useScrollableVaults from './hooks/useScrollableVaults';
import InfiniteScroll from 'react-infinite-scroll-component';

const useStyles = makeStyles(styles);

const DataLoader = memo(function HomeDataLoader() {
  const pricesLastUpdated = useSelector(state => state.pricesReducer.lastUpdated);
  const vaultLastUpdated = useSelector(state => state.vaultReducer.lastUpdated);
  const walletAddress = useSelector(state => state.walletReducer.address);
  const dispatch = useDispatch();

  useEffect(() => {
    if (walletAddress && vaultLastUpdated > 0) {
      dispatch(reduxActions.balance.fetchBalances());
    }
  }, [dispatch, walletAddress, vaultLastUpdated]);

  useEffect(() => {
    if (pricesLastUpdated > 0) {
      dispatch(reduxActions.vault.fetchPools());
    }
  }, [dispatch, pricesLastUpdated]);

  useEffect(() => {
    const id = setInterval(() => {
      dispatch(reduxActions.vault.fetchPools());
    }, 60000);

    return () => clearInterval(id);
  }, [dispatch]);

  return null;
});

const VaultsHeader = memo(function HomeVaultsHeader() {
  const classes = useStyles();
  const { t } = useTranslation();
  const totalTvl = useSelector(state => state.vaultReducer.totalTvl);

  return (
    <Box className={classes.header}>
      <Box className={classes.title}>{t('Vaults-Title')}</Box>
      <Box className={classes.tvl}>
        <Box className={classes.tvlLabel}>{t('TVL')} </Box>
        {totalTvl ? <Box className={classes.tvlValue}>{formatUsd(totalTvl)}</Box> : <ApyLoader />}
      </Box>
    </Box>
  );
});

const VaultsList = memo(function HomeVaultsList() {
  const classes = useStyles();
  const { t } = useTranslation();
  const isPoolsLoading = useSelector(state => state.vaultReducer.isPoolsLoading);
  const platforms = useSelector(state => state.vaultReducer.platforms);
  const [filteredVaults, filterConfig, setFilterConfig, filteredCount, allCount] = useVaults();
  const [loadedVaults, loadedVaultsCount, haveMoreVaults, loadMoreVaults] =
    useScrollableVaults(filteredVaults);

  if (isPoolsLoading) {
    return <Loader text={t('Vaults-LoadingData')} />;
  }

  return (
    <>
      <Filter
        sortConfig={filterConfig}
        setSortConfig={setFilterConfig}
        platforms={platforms}
        allCount={allCount}
        filteredCount={filteredCount}
      />
      <div className={classes.numberOfVaults}>
        {t('Filter-ShowingVaults', { number: filteredCount })}
      </div>
      <div className={classes.vaultsList}>
        {filteredCount ? (
          <InfiniteScroll
            dataLength={loadedVaultsCount}
            hasMore={haveMoreVaults}
            next={loadMoreVaults}
            loader={t('Filter-LoadingSearch')}
          >
            {loadedVaults.map(item => (
              <Item key={item.id} id={item.id} />
            ))}
          </InfiniteScroll>
        ) : null}
      </div>
    </>
  );
});

const Home = () => {
  return (
    <React.Fragment>
      <DataLoader />
      <Portfolio />
      <Container maxWidth="lg">
        <VaultsHeader />
        <VaultsList />
      </Container>
    </React.Fragment>
  );
};

export default Home;
