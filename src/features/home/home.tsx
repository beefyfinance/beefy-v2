/* eslint-disable no-restricted-globals */
import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/styles/makeStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Container from '@material-ui/core/Container';
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
import ceil from 'lodash/ceil';
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
  constructor(props: VirtualVaultsListProps) {
    super(props);
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
  }

  render() {
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
                  rowCount={ceil(this.props.vaults.length / this.props.columns)}
                  rowHeight={this.cache.rowHeight}
                  cellRenderer={this._renderVault}
                  scrollTop={scrollTop}
                  width={width}
                  deferredMeasurementCache={this.cache}
                  columnCount={this.props.columns}
                  columnWidth={width / this.props.columns}
                  style={{ outline: 'none' }}
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
