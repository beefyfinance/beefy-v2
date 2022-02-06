/* eslint-disable no-restricted-globals */
import React, { memo, RefObject } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, useMediaQuery } from '@material-ui/core';
import { Filter } from './components/Filter';
import { Portfolio } from './components/Portfolio';
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
import { selectIsVaultListAvailable } from '../data/selectors/data-loader';
import { selectIsWalletConnected } from '../data/selectors/wallet';
import { selectFilteredVaults, selectFilterOptions } from '../data/selectors/filtered-vaults';
import { VaultEntity } from '../data/entities/vault';
import { useBeefyData } from '../../useBeefyData';

const useStyles = makeStyles(styles as any);

export function notifyResize() {
  const event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, false);
  window.dispatchEvent(event);
}

interface VirtualVaultsListProps {
  vaults: VaultEntity[];
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
    // debounce to avoid constant reloading on resize
    this._onScroll = debounce(this._onScroll.bind(this), 250);
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
                  onScroll={(...params) => {
                    this._onScroll();
                    return onChildScroll(...params);
                  }}
                  overscanRowCount={15}
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

    return (
      <CellMeasurer
        cache={this.cache}
        key={key}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        parent={parent}
      >
        {({ registerChild }) => (
          <div
            style={{ maxWidth: this.props.columns === 2 ? '50%' : undefined, ...style }}
            ref={registerChild}
            data-id={vault ? vault.id : 'null'}
          >
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

  _onScroll() {
    // list need rework, especially in 2 column mode where each cell should correspond
    // to 2 vaults, hacking 2 column with 1 vault per cell makes everything buggy
    // so this is a temporary fix until it's fixed
    this.cache.clearAll();
  }
}

const VaultsList = memo(function HomeVaultsList() {
  const classes = useStyles();
  const { t } = useTranslation();
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 960px)');
  const isVaultListAvailable = useSelector(selectIsVaultListAvailable);
  const filterOptions = useSelector(selectFilterOptions);
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const vaults = useSelector(selectFilteredVaults);

  if (!isVaultListAvailable) {
    return <CowLoader text={t('Vaults-LoadingData')} />;
  }

  return (
    <>
      <Filter />
      <div className={classes.vaultsList}>
        {filterOptions.userCategory === 'deposited' && isWalletConnected && vaults.length === 0 && (
          <EmptyStates />
        )}
        {filterOptions.userCategory === 'deposited' && !isWalletConnected && <EmptyStates />}
        {filterOptions.userCategory === 'eligible' && !isWalletConnected && <EmptyStates />}
        <VirtualVaultsList vaults={vaults} columns={isTwoColumns ? 2 : 1} />
      </div>
    </>
  );
});

export const Home = () => {
  const classes = useStyles();
  useBeefyData();
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
