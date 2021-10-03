import React, { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, Grid } from '@material-ui/core';
import reduxActions from '../redux/actions';
import Filter from 'features/home/components/Filter';
import Portfolio from 'features/home/components/Portfolio';
import Loader from 'components/CowLoader';
import useVaults from './hooks/useFilteredVaults';
import styles from './styles';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  WindowScroller,
} from 'react-virtualized';
import Item from './components/Item';

const useStyles = makeStyles(styles);

export function notifyResize() {
  const event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, false);
  window.dispatchEvent(event);
}

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

/*const VaultsHeader = memo(function HomeVaultsHeader() {
  const classes = useStyles();
  const { t } = useTranslation();
  const totalTvl = useSelector(state => state.vaultReducer.totalTvl.toNumber());

  return (
    <Box className={classes.header}>
      <Box className={classes.title}>{t('Vaults-Title')}</Box>
      <Box className={classes.tvl}>
        <Box className={classes.tvlLabel}>{t('TVL')} </Box>
        {totalTvl ? <Box className={classes.tvlValue}>{formatUsd(totalTvl)}</Box> : <ApyLoader />}
      </Box>
    </Box>
  );
});*/

function createVaultRenderer(vaults, cache) {
  return function vaultRenderer({ index, parent, key, style }) {
    const vault = (
      <Grid item xs={12} sm={6} md={12}>
        <Item id={vaults[index].id} />
      </Grid>
    );

    return (
      <CellMeasurer cache={cache} key={key} columnIndex={0} rowIndex={index} parent={parent}>
        {({ registerChild }) => (
          <div style={style} ref={registerChild}>
            {vault}
          </div>
        )}
      </CellMeasurer>
    );
  };
}

function createVaultHeightCache(vaults) {
  return new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 140,
    keyMapper: function (index) {
      return vaults[index].id + ':' + window.innerWidth;
    },
  });
}

function useVaultRenderer(vaults) {
  const cache = useMemo(() => createVaultHeightCache(vaults), [vaults]);
  const renderer = useMemo(() => createVaultRenderer(vaults, cache), [vaults, cache]);

  return { renderer, cache };
}

const VirtualVaultsList = memo(function VirtualVaultsList({ vaults }) {
  const { renderer, cache } = useVaultRenderer(vaults);

  return (
    <WindowScroller>
      {({ height, isScrolling, registerChild, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <div ref={registerChild}>
              <List
                autoHeight
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                overscanRowCount={2}
                rowCount={vaults.length}
                rowHeight={cache.rowHeight}
                rowRenderer={renderer}
                scrollTop={scrollTop}
                width={width}
                deferredMeasurementCache={cache}
              />
            </div>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
});

const VaultsList = memo(function HomeVaultsList() {
  const classes = useStyles();
  const { t } = useTranslation();
  const isPoolsLoading = useSelector(state => state.vaultReducer.isPoolsLoading);
  const platforms = useSelector(state => state.vaultReducer.platforms);
  const [filteredVaults, filterConfig, setFilterConfig, filteredCount, allCount] = useVaults();

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
      <div className={classes.vaultsList}>
        <VirtualVaultsList vaults={filteredVaults} />
      </div>
    </>
  );
});

const Home = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <DataLoader />
      <Portfolio />
      <Container maxWidth="lg" className={classes.vaultContainer}>
        {/*<VaultsHeader />*/}
        <VaultsList />
      </Container>
    </React.Fragment>
  );
};

export default Home;
