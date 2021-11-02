import React, { memo, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, Grid } from '@material-ui/core';
import { reduxActions } from '../redux/actions';
import { Filter } from './components/Filter';
import { Portfolio } from './components/Portfolio';
import { CowLoader } from '../../components/CowLoader/CowLoader';
import { useVaults } from './hooks/useFilteredVaults';
import { EmptyStates } from './components/EmptyStates';
import { styles } from './styles';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  WindowScroller,
  Grid as GridVirtualized,
} from 'react-virtualized';
import { Item } from './components/Item';
import { ceil } from 'lodash';

const useStyles = makeStyles(styles as any);
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

function createVaultRenderer(vaults, isTwoColumns, cache) {
  return function vaultRenderer({ rowIndex, columnIndex, parent, key, style }) {
    const vault = (
      <Grid item xs={12}>
        <Item vault={isTwoColumns ? vaults[rowIndex * 2 + columnIndex] : vaults[rowIndex]} />
      </Grid>
    );

    return (
      <CellMeasurer
        cache={cache}
        key={key}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        parent={parent}
      >
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

function useVaultRenderer(vaults, isTwoColumns) {
  const cache = useMemo(() => createVaultHeightCache(vaults), [vaults]);
  const renderer = useMemo(
    () => createVaultRenderer(vaults, isTwoColumns, cache),
    [vaults, isTwoColumns, cache]
  );

  return { renderer, cache };
}

const VirtualVaultsList = memo(function VirtualVaultsList({ vaults }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isTwoColumns, setIsTwoColumns] = useState(windowWidth > 599 && windowWidth < 960);

  const updateDimensions = async () => {
    setWindowWidth(window.innerWidth);
    setIsTwoColumns(windowWidth > 599 && windowWidth < 960);
    console.log(windowWidth + ' ' + isTwoColumns);
  };

  useEffect(() => {
    window.addEventListener('resize', updateDimensions());
  });

  const { renderer, cache } = useVaultRenderer(vaults, isTwoColumns);

  return (
    <WindowScroller>
      {({ height, isScrolling, registerChild, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <div ref={registerChild}>
              <GridVirtualized
                autoHeight
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                overscanRowCount={2}
                rowCount={isTwoColumns ? ceil(vaults.length / 2) : vaults.length}
                rowHeight={cache.rowHeight}
                cellRenderer={renderer}
                scrollTop={scrollTop}
                width={width}
                deferredMeasurementCache={cache}
                columnCount={isTwoColumns ? 2 : 1}
                columnWidth={isTwoColumns ? width / 2 : width}
                style={{ outline: 'none' }}
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
  const address = useSelector(state => state.walletReducer.address);

  if (isPoolsLoading) {
    return <CowLoader text={t('Vaults-LoadingData')} />;
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
        {filterConfig.deposited && address && filteredVaults.length === 0 && (
          <EmptyStates setFilterConfig={setFilterConfig} connected={address} />
        )}
        {console.log(address)}
        {filterConfig.deposited && !address && (
          <EmptyStates setFilterConfig={setFilterConfig} connected={address} />
        )}
        <VirtualVaultsList vaults={filteredVaults} />
      </div>
    </>
  );
});

export const Home = () => {
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