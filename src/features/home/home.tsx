import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, useMediaQuery } from '@material-ui/core';
import { Filter } from './components/Filter';
import { Portfolio } from './components/Portfolio';
import { EmptyStates } from './components/EmptyStates';
import { styles } from './styles';
import { AutoSizer, Grid as GridVirtualized, WindowScroller } from 'react-virtualized';
import { Item } from './components/Item';
import { ceil, debounce } from 'lodash';
import { CowLoader } from '../../components/CowLoader';
import { selectIsVaultListAvailable } from '../data/selectors/data-loader';
import { selectIsWalletConnected } from '../data/selectors/wallet';
import { selectFilteredVaults, selectFilterOptions } from '../data/selectors/filtered-vaults';
import { isGovVault, isMaxiVault, VaultEntity } from '../data/entities/vault';

const useStyles = makeStyles(styles as any);

interface VirtualVaultsListProps {
  vaults: VaultEntity[];
  columns: number;
  cards: boolean;
  spaceBetweenRows: number;
}

interface VirtualVaultsListState {
  addFakeElement: boolean;
}

class VirtualVaultsList extends React.Component<VirtualVaultsListProps, VirtualVaultsListState> {
  constructor(props: VirtualVaultsListProps) {
    super(props);

    this._renderVault = this._renderVault.bind(this);
    this._getRowHeight = this._getRowHeight.bind(this);
    this._onResize = debounce(this._onResize.bind(this), 50);

    this.state = {
      addFakeElement: false,
    };
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
                  overscanRowCount={15}
                  rowCount={
                    ceil(this.props.vaults.length / this.props.columns) +
                    (this.state.addFakeElement ? 1 : 0)
                  }
                  rowHeight={params => {
                    /**
                     * Ok so this is the only way I found to reset the style cache
                     * by passing a new function reference each time this component
                     * re-renders.
                     *
                     * Without this, when the list changes, the element height are not
                     * updated. Ex: render the grid with a first element with a large height
                     * (a gov vault) then update the grid to have a smaller element on the
                     * first place (a standard vault). This element will receive the height
                     * property from the style cache and have a larger height than normal.
                     * This height affects the element, but also serves for placing elements
                     * that are below it.
                     *
                     * There seem to be no way to reset the style cache programatically
                     * but I found that react-virtualized checks rowWidth and rowHeight
                     * properties references to know if it needs to reset the style cache on
                     * the getDerivedStateFromProps handler.
                     * https://github.com/bvaughn/react-virtualized/blob/abe0530a512639c042e74009fbf647abdb52d661/source/Grid/Grid.js#L859
                     *
                     * So by passing a new function reference each time we re-render we
                     * force the style cache to be reset.
                     */
                    return this._getRowHeight(params);
                  }}
                  cellRenderer={this._renderVault}
                  scrollTop={scrollTop}
                  width={width}
                  columnCount={this.props.columns}
                  columnWidth={width / this.props.columns}
                />
              </div>
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    );
  }

  _renderVault({ rowIndex, columnIndex, key, style }) {
    const index = rowIndex * this.props.columns + columnIndex;
    const vault = this.props.vaults[index] ?? null;

    // this is our fake row
    if (!vault) {
      return <div style={style}></div>;
    }

    // compute the space between cards
    const spacerStyles = {
      paddingBottom: this.props.spaceBetweenRows,
      paddingLeft: 0,
      paddingRight: 0,
    };
    if (this.props.columns === 2) {
      if (columnIndex === 0) {
        spacerStyles.paddingRight = this.props.spaceBetweenRows / 2;
      } else if (columnIndex === 1) {
        spacerStyles.paddingLeft = this.props.spaceBetweenRows / 2;
      }
    }

    return (
      <div key={key} style={{ ...style, ...spacerStyles }}>
        <Item vault={vault} />
      </div>
    );
  }

  /**
   * Have a static way to compute row height
   * for performance. All numbers are expressed in px
   */
  _getRowHeight({ index }: { index: number }) {
    const vault = this.props.vaults[index] ?? null;

    // this is our fake row
    if (!vault) {
      return 0;
    }

    // this should happen on large screen
    if (this.props.cards === false) {
      if (isGovVault(vault)) {
        return this.props.spaceBetweenRows + 162;
      } else {
        return this.props.spaceBetweenRows + 138;
      }
    }

    // in 2 column mode we have to know if there is a gov vault in the row
    // if index is even, current cell is left cell, otherwise it's right cell
    if (this.props.cards === true) {
      // too many weird bugs, just make everything larger
      return this.props.spaceBetweenRows + 375;
      /*
      const isEvenIdx = index % 2 === 0; // if slow, use bitwise tricks
      const neighbourVault =
        (isEvenIdx ? this.props.vaults[index + 1] : this.props.vaults[index - 1]) ?? null;

      let isNeighbourAGovVault = false;
      // this is our fake row
      if (neighbourVault) {
        isNeighbourAGovVault = isGovVault(neighbourVault);
      }

      if (isGovVault(vault) || isNeighbourAGovVault) {
        return this.props.spaceBetweenRows + 418;
      } else {
        return this.props.spaceBetweenRows + 375;
      }*/
    }

    // this should happen on super small screens where 2 columns don't fit
    if (this.props.columns === 1 && this.props.cards === true) {
      if (isGovVault(vault)) {
        return this.props.spaceBetweenRows + 398;
      } else if (isMaxiVault(vault)) {
        return this.props.spaceBetweenRows + 399;
      } else {
        return this.props.spaceBetweenRows + 372;
      }
    }

    // some default large value in case we forgot a case
    // users will still see the entier vault cards, just super spaced out
    return this.props.spaceBetweenRows + 1000;
  }

  componentDidUpdate(prevProps: Readonly<VirtualVaultsListProps>): void {
    if (
      this.props.vaults.length > 0 &&
      prevProps.vaults !== this.props.vaults &&
      //prevProps.vaults.length === this.props.vaults.length &&
      this.state.addFakeElement === false
    ) {
      this._forceItemHeightRecompute();
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }
  _onResize() {
    this._forceItemHeightRecompute();
  }

  _forceItemHeightRecompute() {
    /**
     * soooooo, this is a hack to bypass the CellSizeAndPositionManager or react-virtualized
     * basically the row height will not get recomputed if the rowHeight is not a number
     * (which is needed to bypass a style cache, see above for more details)
     * But there is an edge case when the list changes but has the same number of elements,
     * the height is not re-computed
     * https://github.com/bvaughn/react-virtualized/blob/abe0530a512639c042e74009fbf647abdb52d661/source/Grid/utils/CellSizeAndPositionManager.js#L93
     * https://github.com/bvaughn/react-virtualized/blob/abe0530a512639c042e74009fbf647abdb52d661/source/Grid/utils/calculateSizeAndPositionDataAndUpdateScrollOffset.js#L36
     *
     * To fix this, we remember the previous list length to introduce "fake" elements and force
     * this cache to reset here:
     * https://github.com/bvaughn/react-virtualized/blob/abe0530a512639c042e74009fbf647abdb52d661/source/Grid/Grid.js#L902
     *
     * But this can create a new situation where the first render has 2 elements, second has 2
     * elements and third render has 3 elements. If we introduce a "fake" element on the second
     * render, the third render will has the same element count as the second render from
     * the PoV of the grid.
     *
     * This is why we have to reset the "fake" state
     * so the initial render will always be a normal render
     * */
    this.setState(
      () => ({ addFakeElement: true }),
      () => {
        this.setState({ addFakeElement: false });
      }
    );
  }
}

const VaultsList = memo(function HomeVaultsList() {
  const classes = useStyles();
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 959px)');
  // we switch to vault cards on smaller screens or when doing 2 columns
  const isVaultCard = useMediaQuery('(max-width: 959px)');
  const filterOptions = useSelector(selectFilterOptions);
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const vaults = useSelector(selectFilteredVaults);

  return (
    <div className={classes.vaultsList}>
      {filterOptions.userCategory === 'deposited' && isWalletConnected && vaults.length === 0 && (
        <EmptyStates />
      )}
      {filterOptions.userCategory === 'deposited' && !isWalletConnected && <EmptyStates />}
      {filterOptions.userCategory === 'eligible' && !isWalletConnected && <EmptyStates />}
      <VirtualVaultsList
        vaults={vaults}
        columns={isTwoColumns ? 2 : 1}
        cards={isVaultCard}
        spaceBetweenRows={20}
      />
    </div>
  );
});

export const Home = () => {
  const classes = useStyles();

  const { t } = useTranslation();
  const isVaultListAvailable = useSelector(selectIsVaultListAvailable);

  if (!isVaultListAvailable) {
    return <CowLoader text={t('Vaults-LoadingData')} />;
  }

  return (
    <React.Fragment>
      <Portfolio />
      <Container maxWidth="lg" className={classes.vaultContainer}>
        <Filter />
        <VaultsList />
      </Container>
    </React.Fragment>
  );
};
