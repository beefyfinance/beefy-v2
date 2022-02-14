import React, { memo, RefObject } from 'react';
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
import { VaultEntity } from '../data/entities/vault';
import { Item } from './components/Item';
import { debounce } from 'lodash';

const useStyles = makeStyles(styles as any);

interface VirtualVaultsListProps {
  vaults: VaultEntity[];
  columns: number;
  cards: boolean;
  spaceBetweenRows: number;
  batchSize: number;
  estimatedRowSize: number;
}

interface VirtualVaultsListState {
  renderUntilRow: number;
}

class VirtualVaultsList extends React.Component<VirtualVaultsListProps, VirtualVaultsListState> {
  scrollProbe: RefObject<HTMLDivElement>;
  constructor(props: VirtualVaultsListProps) {
    super(props);
    this.scrollProbe = React.createRef();

    this.state = {
      renderUntilRow: props.batchSize * 2,
    };
    this._onScroll = debounce(this._onScroll.bind(this), 10);
  }

  render() {
    const { estimatedRowSize, spaceBetweenRows, batchSize } = this.props;
    const { renderUntilRow } = this.state;
    return (
      <AutoSizer disableHeight>
        {({ width }) => (
          <div
            style={{
              minHeight: (estimatedRowSize + spaceBetweenRows) * this.props.vaults.length,
              width,
            }}
          >
            {this.props.vaults.slice(0, renderUntilRow).map((vault, i) => {
              return (
                <div key={i} style={{ marginBottom: spaceBetweenRows }}>
                  <Item vault={vault} />
                </div>
              );
            })}
            <div ref={this.scrollProbe}></div>
          </div>
        )}
      </AutoSizer>
    );
  }

  _onScroll() {
    if (!this.scrollProbe.current) {
      return;
    }
    const scrollProbePosition = getYPosition(this.scrollProbe.current);
    const currentWindowScroll = window.pageYOffset;
    const screenHeight = window.screen.height;
    // we should render until scrollProbe is always at least 0.5 batch size away
    const batchEstimatedSize =
      this.props.estimatedRowSize * (this.props.batchSize + this.props.spaceBetweenRows);

    const screenbottomPos = currentWindowScroll + screenHeight;
    // we render another batch if we get too close from the probe
    if (screenbottomPos + 0.5 * batchEstimatedSize > scrollProbePosition) {
      this.setState(state => ({ renderUntilRow: state.renderUntilRow + this.props.batchSize }));
    }
    // we render less if we get too far
    if (screenbottomPos + 1.5 * batchEstimatedSize < scrollProbePosition) {
      this.setState(state => ({ renderUntilRow: state.renderUntilRow - this.props.batchSize }));
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this._onScroll);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this._onScroll);
  }
}

function getYPosition(el) {
  var y = 0;
  while (el && !isNaN(el.offsetTop)) {
    y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return y;
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
        estimatedRowSize={isTwoColumns ? 400 : 150}
        batchSize={10}
      ></VirtualVaultsList>
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
