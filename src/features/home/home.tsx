import React, {memo, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Container, makeStyles, useMediaQuery} from '@material-ui/core';
import {reduxActions} from '../redux/actions';
import {Filter} from './components/Filter';
import {Portfolio} from './components/Portfolio';
import {useVaults} from './hooks/useFilteredVaults';
import {EmptyStates} from './components/EmptyStates';
import {styles} from './styles';
import {AutoSizer, CellMeasurer, CellMeasurerCache, Grid as GridVirtualized, WindowScroller,} from 'react-virtualized';
import {Item} from './components/Item';
import {ceil} from 'lodash';
import {CowLoader} from '../../components/CowLoader';

const useStyles = makeStyles(styles as any);

export function notifyResize() {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
}

const DataLoader = memo(function HomeDataLoader() {
    const pricesLastUpdated = useSelector((state: any) => state.pricesReducer.lastUpdated);
    const vaultLastUpdated = useSelector((state: any) => state.vaultReducer.lastUpdated);
    const walletAddress = useSelector((state: any) => state.walletReducer.address);
    const dispatch = useDispatch();

    useEffect(() => {
        if (walletAddress && vaultLastUpdated > 0) {
            dispatch(reduxActions.balance.fetchBalances());
        }
    }, [dispatch, walletAddress, vaultLastUpdated]);

    useEffect(() => {
        if (walletAddress && vaultLastUpdated > 0) {
            dispatch(reduxActions.balance.fetchBoostBalances());
        }
    }, [dispatch, walletAddress, vaultLastUpdated]);

    useEffect(() => {
        if (pricesLastUpdated > 0) {
            dispatch(reduxActions.vault.fetchPools());
        }
    }, [dispatch, pricesLastUpdated]);

    useEffect(() => {
        if (pricesLastUpdated > 0) {
            dispatch(reduxActions.vault.fetchBoosts());
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
  const totalTvl = useSelector((state: any) => state.vaultReducer.totalTvl.toNumber());

  return (
    <Box className={classes.header}>
      <Box className={classes.title}>{t('Vaults-Title')}</Box>
      <Box className={classes.tvl}>
        <Box className={classes.tvlLabel}>{t('TVL')} </Box>
        {totalTvl ? <Box className={classes.tvlValue}>{formatUsd(totalTvl)}</Box> : <ApyStatLoader />}
      </Box>
    </Box>
  );
});*/

function createVaultRenderer(vaults, columns, cache) {
    return function vaultRenderer({rowIndex, columnIndex, parent, key, style}) {
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
                {({registerChild}) => (
                    <div style={style} ref={registerChild} data-id={vault ? vault.id : 'null'}>
                        {vault ? <Item vault={vault}/> : null}
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
            if (index in vaults) {
                return vaults[index].id + ':' + rowIndex + ':' + columnIndex + ':' + window.innerWidth;
            }
            return rowIndex + ':' + columnIndex + ':' + window.innerWidth;
        },
    });
}

function useVaultRenderer(vaults, isTwoColumns) {
    const cache = useMemo(() => createVaultHeightCache(vaults, isTwoColumns ? 2 : 1), [vaults]);
    const renderer = useMemo(
        () => createVaultRenderer(vaults, isTwoColumns ? 2 : 1, cache),
        [vaults, isTwoColumns, cache]
    );

    return {renderer, cache};
}

const VirtualVaultsList = memo(({vaults}: any) => {
    const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 960px)');
    const {renderer, cache} = useVaultRenderer(vaults, isTwoColumns);

    return (
        <WindowScroller>
            {({height, isScrolling, registerChild, onChildScroll, scrollTop}) => (
                <AutoSizer disableHeight>
                    {({width}) => (
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
                                style={{outline: 'none'}}
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
    const {t} = useTranslation();
    const isPoolsLoading = useSelector((state: any) => state.vaultReducer.isPoolsLoading);
    const platforms = useSelector((state: any) => state.vaultReducer.platforms);
    const [filteredVaults, filterConfig, setFilterConfig, filteredCount, allCount] = useVaults();
    const address = useSelector((state: any) => state.walletReducer.address);

    if (isPoolsLoading) {
        return <CowLoader text={t('Vaults-LoadingData')}/>;
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
                    <EmptyStates setFilterConfig={setFilterConfig}/>
                )}
                {filterConfig.deposited && !address && <EmptyStates setFilterConfig={setFilterConfig}/>}
                <VirtualVaultsList vaults={filteredVaults}/>
            </div>
        </>
    );
});

export const Home = () => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <DataLoader/>
            <Portfolio/>
            <Container maxWidth="lg" className={classes.vaultContainer}>
                {/*<VaultsHeader />*/}
                <VaultsList/>
            </Container>
        </React.Fragment>
    );
};
