/* eslint-disable no-restricted-globals */
import React, { memo, RefObject } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, useMediaQuery } from '@material-ui/core';
import { Filter } from './components/Filter';
import { Portfolio } from './components/Portfolio';
import { EmptyStates } from './components/EmptyStates';
import { styles } from './styles';
import { AutoSizer, Grid as GridVirtualized, WindowScroller } from 'react-virtualized';
import { Item } from './components/Item';
import { ceil } from 'lodash';
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

class VirtualVaultsList extends React.Component<VirtualVaultsListProps> {
  gridRef: RefObject<any>;

  constructor(props: VirtualVaultsListProps) {
    super(props);

    this.gridRef = React.createRef();
    this._renderVault = this._renderVault.bind(this);
    this._getRowHeight = this._getRowHeight.bind(this);
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
                  rowHeight={this._getRowHeight}
                  cellRenderer={this._renderVault}
                  scrollTop={scrollTop}
                  width={width}
                  columnCount={this.props.columns}
                  columnWidth={width / this.props.columns}
                  ref={this.gridRef}
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

    // this should happen on large screen
    if (this.props.columns === 1 && this.props.cards === false) {
      if (isGovVault(vault)) {
        return this.props.spaceBetweenRows + 162;
      } else {
        return this.props.spaceBetweenRows + 138;
      }
    }

    // in 2 column mode we have to know if there is a gov vault in the row
    // if index is even, current cell is left cell, otherwise it's right cell
    if (this.props.columns === 2 && this.props.cards === true) {
      const isEvenIdx = index % 2 === 0; // if slow, use bitwise tricks
      const neighbourVault =
        (isEvenIdx ? this.props.vaults[index + 1] : this.props.vaults[index - 1]) ?? null;

      if (isGovVault(vault) || isGovVault(neighbourVault)) {
        return this.props.spaceBetweenRows + 418;
      } else {
        return this.props.spaceBetweenRows + 375;
      }
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

  shouldComponentUpdate(nextProps: Readonly<VirtualVaultsListProps>): boolean {
    return this.props.vaults !== nextProps.vaults;
  }

  componentDidUpdate(prevProps: Readonly<VirtualVaultsListProps>): void {
    if (prevProps.vaults !== this.props.vaults) {
      // tell the grid about the updated height data
      // this method is way faster than unmounting and remounting the component
      if (this.gridRef.current) {
        this.gridRef.current.forceUpdate();
      }
    }
  }
}

const VaultsList = memo(function HomeVaultsList() {
  const classes = useStyles();
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 960px)');
  // we switch to vault cards on smaller screens or when doing 2 columns
  const isVaultCard = useMediaQuery('(max-width: 960px)');
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
