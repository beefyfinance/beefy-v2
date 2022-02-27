import React, { memo, ReactNode, RefObject, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Container, makeStyles, useMediaQuery } from '@material-ui/core';
import { Filter } from './components/Filter';
import { Portfolio } from './components/Portfolio';
import { EmptyStates } from './components/EmptyStates';
import { styles } from './styles';
import { AutoSizer } from 'react-virtualized';
import { CowLoader } from '../../components/CowLoader';
import { selectIsVaultListAvailable } from '../data/selectors/data-loader';
import { selectIsWalletConnected } from '../data/selectors/wallet';
import { selectFilteredVaults, selectFilterOptions } from '../data/selectors/filtered-vaults';
import { Item } from './components/Item';
import { debounce } from 'lodash';

const useStyles = makeStyles(styles as any);

interface LargeListProps {
  list: unknown[];
  rowCount: number;
  rowRenderer: (index: number) => ReactNode;
  spaceBetweenRows: number;
  batchSize: number;
  estimatedRowSize: number;
}
interface LargeListState {
  renderUntilRow: number;
}

/**
 * We cannot use a list virtualization lib as design requirements have been set
 * so each list item size depends on actual content size.
 * Using react-virtualized + cellmeasurer leaded to many hard to track bugs
 * and there is a style cache and a height and position cache that needs to be
 * hacked around when resizing or when updating the vault list.
 *
 * So we landed on this solution which is not optimal perf wise but is way simpler
 * to maintain.
 * It works by tracking a specific element at the bottom of the page, if the tracking
 * element is within a relatively close distance, we re-render with more elements.
 *
 * This way, we only render each element once and the next elements position can depend
 * on the current element content, which makes iterating on style way easier.
 */
class LargeList extends React.PureComponent<LargeListProps, LargeListState> {
  scrollProbe: RefObject<HTMLDivElement>;
  constructor(props: LargeListProps) {
    super(props);
    this.scrollProbe = React.createRef();

    this.state = {
      renderUntilRow: props.batchSize,
    };
    this._refreshRowToBeRendered = debounce(this._refreshRowToBeRendered.bind(this), 10);
  }

  render() {
    const { estimatedRowSize, spaceBetweenRows, rowCount, rowRenderer } = this.props;
    const { renderUntilRow } = this.state;
    const indicesToRender = Array.from({ length: renderUntilRow });
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <div
            style={{
              minHeight:
                renderUntilRow >= rowCount
                  ? undefined
                  : (estimatedRowSize + spaceBetweenRows) * rowCount,
              width,
            }}
          >
            {indicesToRender.map((_, i) => {
              return (
                <div key={i} style={{ marginBottom: spaceBetweenRows }}>
                  {rowRenderer(i)}
                </div>
              );
            })}
            <div ref={this.scrollProbe}></div>
          </div>
        )}
      </AutoSizer>
    );
  }

  _getElementYPosition(el: any) {
    var y = 0;
    while (el && !isNaN(el.offsetTop)) {
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return y;
  }

  _refreshRowToBeRendered() {
    if (!this.scrollProbe.current) {
      return;
    }
    // no more rows to show
    if (this.state.renderUntilRow > this.props.rowCount) {
      return;
    }

    const scrollProbePos = this._getElementYPosition(this.scrollProbe.current);
    const screenTopPos = window.pageYOffset;
    const screenHeight = window.screen.height;
    const screenbottomPos = screenTopPos + screenHeight;

    // we should render until scrollProbe is always at least 0.5 batch size away
    const batchEstimatedSize =
      (this.props.estimatedRowSize + this.props.spaceBetweenRows) * this.props.batchSize;

    // if we scroll too fast down, we might want to send many batches at once
    if (screenbottomPos > scrollProbePos) {
      const approxBatchesToRender = Math.ceil(
        (screenbottomPos - scrollProbePos) / batchEstimatedSize
      );
      return this.setState(state => ({
        renderUntilRow: state.renderUntilRow + approxBatchesToRender * this.props.batchSize,
      }));
    }

    // we render another batch if we get too close from the probe
    if (screenbottomPos + 1.0 * batchEstimatedSize > scrollProbePos) {
      return this.setState(state => ({
        renderUntilRow: state.renderUntilRow + this.props.batchSize,
      }));
    }
    // we render less if we get too far
    if (screenbottomPos + 2.5 * batchEstimatedSize < scrollProbePos) {
      return this.setState(state => ({
        renderUntilRow: state.renderUntilRow - this.props.batchSize,
      }));
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this._refreshRowToBeRendered);
    window.addEventListener('resize', this._refreshRowToBeRendered);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this._refreshRowToBeRendered);
    window.removeEventListener('resize', this._refreshRowToBeRendered);
  }
}

const VaultsList = memo(function HomeVaultsList() {
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 959px)');
  // we switch to vault cards on smaller screens or when doing 2 columns
  const isVaultCard = useMediaQuery('(max-width: 959px)');
  const filterOptions = useSelector(selectFilterOptions);
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const vaults = useSelector(selectFilteredVaults);
  const spaceBetweenRows = 20;
  const classes = useStyles(spaceBetweenRows);

  // so we render 2 by 2 to handle column case
  const renderRow = useCallback(
    (index: number) => {
      const vaultIdx = index * 2;
      if (!vaults[vaultIdx]) {
        return <></>;
      }
      return (
        <div className={classes.doubleItemContainer}>
          <div className={classes.doubleItem1}>
            {vaults[vaultIdx] ? <Item vault={vaults[vaultIdx]} /> : null}
          </div>
          <div className={classes.doubleItem2}>
            {vaults[vaultIdx + 1] ? <Item vault={vaults[vaultIdx + 1]} /> : null}
          </div>
        </div>
      );
    },
    [vaults, classes]
  );

  return (
    <div className={classes.vaultsList}>
      {filterOptions.userCategory === 'deposited' && isWalletConnected && vaults.length === 0 && (
        <EmptyStates />
      )}
      {filterOptions.userCategory === 'deposited' && !isWalletConnected && <EmptyStates />}
      {filterOptions.userCategory === 'eligible' && !isWalletConnected && <EmptyStates />}
      <LargeList
        batchSize={5}
        spaceBetweenRows={spaceBetweenRows}
        estimatedRowSize={(isTwoColumns || isVaultCard ? 400 : 150) * 2 + spaceBetweenRows}
        rowCount={Math.ceil(vaults.length / 2)}
        rowRenderer={renderRow}
        list={vaults}
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

// React.Lazy only works on default exports
// eslint-disable-next-line no-restricted-syntax
export default Home;
