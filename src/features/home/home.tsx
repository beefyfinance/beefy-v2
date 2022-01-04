/* eslint-disable no-restricted-globals */
import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, useMediaQuery } from '@material-ui/core';
import { Filter } from './components/Filter';
import { Portfolio } from './components/Portfolio';
import { useVaults } from './hooks/useFilteredVaults';
import { EmptyStates } from './components/EmptyStates';
import { styles } from './styles';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Grid as GridVirtualized,
  WindowScroller,
} from 'react-virtualized';
import { Item } from './components/Item';
import { ceil } from 'lodash';
import { CowLoader } from '../../components/CowLoader';

const useStyles = makeStyles(styles as any);

export function notifyResize() {
  const event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, false);
  window.dispatchEvent(event);
}

function createVaultRenderer(vaults, columns, cache) {
  return function vaultRenderer({ rowIndex, columnIndex, parent, key, style }) {
    const index = rowIndex * columns + columnIndex;
    const vault = vaults[index] ?? null;
    if (!vault) {
      console.log(rowIndex, columnIndex, index);
    }

    return (
      <CellMeasurer
        cache={cache}
        key={key}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        parent={parent}
      >
        {({ registerChild }) => (
          <div style={style} ref={registerChild} data-id={vault ? vault.id : 'null'}>
            {vault ? <Item vault={vault} /> : null}
          </div>
        )}
      </CellMeasurer>
    );
  };
}

function createVaultHeightCache(vaults, columns) {
  return new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 140,
    keyMapper: function (rowIndex, columnIndex) {
      const index = rowIndex * columns + columnIndex;
      const orientation =
        (screen.orientation || {}).type ||
        (screen as any).mozOrientation ||
        (screen as any).msOrientation ||
        'undefined';

      if (index in vaults) {
        return (
          vaults[index].id +
          ':' +
          rowIndex +
          ':' +
          columnIndex +
          ':' +
          orientation +
          ':' +
          window.innerWidth
        );
      }

      return rowIndex + ':' + columnIndex + ':' + orientation + ':' + window.innerWidth;
    },
  });
}

function useVaultRenderer(vaults, isTwoColumns) {
  const cache = useMemo(
    () => createVaultHeightCache(vaults, isTwoColumns ? 2 : 1),
    [isTwoColumns, vaults]
  );
  const renderer = useMemo(
    () => createVaultRenderer(vaults, isTwoColumns ? 2 : 1, cache),
    [vaults, isTwoColumns, cache]
  );

  return { renderer, cache };
}

const VirtualVaultsList = memo(({ vaults }: any) => {
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 960px)');
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
  const isPoolsLoading = useSelector((state: any) => state.vaultReducer.isPoolsLoading);
  const platforms = useSelector((state: any) => state.vaultReducer.platforms);
  const { sortedVaults, filterConfig, setFilterConfig, filteredVaultsCount, allVaultsCount } =
    useVaults();
  const address = useSelector((state: any) => state.walletReducer.address);

  if (isPoolsLoading) {
    return <CowLoader text={t('Vaults-LoadingData')} />;
  }

  return (
    <>
      <Filter
        sortConfig={filterConfig}
        setSortConfig={setFilterConfig}
        platforms={platforms}
        allCount={allVaultsCount}
        filteredCount={filteredVaultsCount}
      />

      <div className={classes.vaultsList}>
        {filterConfig.deposited && address && sortedVaults.length === 0 && (
          <EmptyStates setFilterConfig={setFilterConfig} />
        )}
        {filterConfig.deposited && !address && <EmptyStates setFilterConfig={setFilterConfig} />}
        <VirtualVaultsList vaults={sortedVaults} />
      </div>
    </>
  );
});

export const Home = () => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Portfolio />
      <Container maxWidth="lg" className={classes.vaultContainer}>
        {/*<VaultsHeader />*/}
        <VaultsList />
      </Container>
    </React.Fragment>
  );
};
