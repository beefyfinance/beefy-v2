/* eslint-disable no-restricted-globals */
import React, { memo, RefObject } from 'react';
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
import { ceil, debounce } from 'lodash';
import { CowLoader } from '../../components/CowLoader';

const useStyles = makeStyles(styles as any);

export function notifyResize() {
  const event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, false);
  window.dispatchEvent(event);
}

interface VirtualVaultsListProps {
  vaults: any[];
  columns: number;
}

class VirtualVaultsList extends React.Component<VirtualVaultsListProps> {
  cache: CellMeasurerCache;
  gridRef: RefObject<any>;

  constructor(props: VirtualVaultsListProps) {
    super(props);

    this.gridRef = React.createRef();
    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 140,
      keyMapper: (rowIndex: number, columnIndex: number) => {
        const orientation =
          (screen.orientation || {}).type ||
          (screen as any).mozOrientation ||
          (screen as any).msOrientation ||
          'undefined';

        // due to dynamic content, vaults can take various height
        const vault = this.props.vaults[rowIndex];
        return vault.id + ':' + this.props.columns + ':' + orientation + ':' + window.innerWidth;
      },
    });

    this._renderVault = this._renderVault.bind(this);
    // debounce to avoid constant reloading on resize
    this._onResize = debounce(this._onResize.bind(this), 100);
  }

  render() {
    return (
      <WindowScroller>
        {({ height, isScrolling, registerChild, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight onResize={this._onResize}>
            {({ width }) => (
              <div ref={registerChild}>
                <GridVirtualized
                  autoHeight
                  height={height}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  overscanRowCount={2}
                  rowCount={ceil(this.props.vaults.length / this.props.columns)}
                  rowHeight={this.cache.rowHeight}
                  cellRenderer={this._renderVault}
                  scrollTop={scrollTop}
                  width={width}
                  deferredMeasurementCache={this.cache}
                  columnCount={this.props.columns}
                  columnWidth={width / this.props.columns}
                  style={{ outline: 'none' }}
                  ref={this.gridRef}
                />
              </div>
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    );
  }

  _renderVault({ rowIndex, columnIndex, parent, key, style }) {
    const index = rowIndex * this.props.columns + columnIndex;
    const vault = this.props.vaults[index] ?? null;
    if (!vault) {
      console.log(rowIndex, columnIndex, index);
    }
    return (
      <CellMeasurer
        cache={this.cache}
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
  }

  componentDidUpdate(prevProps: Readonly<VirtualVaultsListProps>): void {
    if (prevProps.vaults !== this.props.vaults) {
      // we need to clear the cache on props change because react-virtualized
      // uses an internal style cache that doesn't uses the keyMapper of our cache
      // see: https://stackoverflow.com/a/65324840
      // other methods include creating a cellRange renderer but it's way more complex
      // see: https://github.com/bvaughn/react-virtualized/issues/1310
      this.cache.clearAll();
      // tell the grid about the updated height data
      // this method is way faster than unmounting and remounting the component
      if (this.gridRef.current) {
        this.gridRef.current.forceUpdate();
      }
    }
  }

  _onResize() {
    // we need to reset height cache on resize due to the WindowScroller
    // and AutoSizer interaction. Changing orientation makes the WindowScroller
    // trigger a render when the AutoSizer didn't have time to trigger yet
    // so rows render with less width, making the height higher due to content overflow
    // and this height is put inside the various height caches
    this.cache.clearAll();
    // tell the grid about the updated height data
    // this method is way faster than unmounting and remounting the component
    if (this.gridRef.current) {
      this.gridRef.current.forceUpdate();
    }
  }
}

const VaultsList = memo(function HomeVaultsList() {
  const classes = useStyles();
  const { t } = useTranslation();
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 960px)');
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
        {filterConfig.zero && !address && <EmptyStates setFilterConfig={setFilterConfig} />}
        <VirtualVaultsList vaults={sortedVaults} columns={isTwoColumns ? 2 : 1} />
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
