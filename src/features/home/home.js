import * as React from "react";
import {useDispatch, useSelector} from "react-redux";
import {formatTvl} from '../../helpers/format'

import {Container, makeStyles} from "@material-ui/core"
import Box from '@material-ui/core/Box';
import Filter from './components/Filter';
import Portfolio from './components/Portfolio';
import styles from "./styles"
import Loader from "../../components/loader";
import {isEmpty} from "../../helpers/utils";
import reduxActions from "../redux/actions";
import Item from "./components/Item";
import InfiniteScroll from "react-infinite-scroll-component";

const useStyles = makeStyles(styles);
const defaultFilter = {
    key: 'default',
    direction: 'desc',
    keyword: '',
    retired: false,
    zero: false,
    deposited: false,
    boost: false,
    experimental: false,
    platform: 'all',
    vault: 'all',
    blockchain: 'all',
    category: 'all',
}

const Home = () => {
    const {vault, wallet, prices} = useSelector(state => ({
        vault: state.vaultReducer,
        wallet: state.walletReducer,
        prices: state.pricesReducer,
    }));

    const dispatch = useDispatch();
    const classes = useStyles();
    const [vaultCount, setVaultCount] = React.useState({showing: 0, total: 0});
    const storage = localStorage.getItem('homeSortConfig');
    const [sortConfig, setSortConfig] = React.useState(storage === null ? defaultFilter : JSON.parse(storage));
    const [filtered, setFiltered] = React.useState([]);
    const [scrollable, setScrollable] = React.useState({items: [], hasMore: true, chunk: 20});

    React.useEffect(() => {
        localStorage.setItem('homeSortConfig', JSON.stringify(sortConfig));

        let data = [];

        const sorted = (items) => {
            return items.sort((a, b) => {
                if(sortConfig.key === 'name') {
                    if (a[sortConfig.key].toUpperCase() < b[sortConfig.key].toUpperCase()) {
                        return sortConfig.direction === 'asc' ? -1 : 1;
                    }
                    if (a[sortConfig.key].toUpperCase() > b[sortConfig.key].toUpperCase()) {
                        return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                    return 0;
                } else {
                    return sortConfig.direction === 'asc' ? (a[sortConfig.key] - b[sortConfig.key]) : (b[sortConfig.key] - a[sortConfig.key]);
                }
            });
        }
        const check = (item) => {
            if(item.status !== (sortConfig.retired ? 'eol' : 'active')) {
                return false;
            }

            if(sortConfig.category !== 'all' && !item.tags.includes(sortConfig.category)) {
                return false;
            }

            if(!item.name.toLowerCase().includes(sortConfig.keyword)) {
                return false;
            }

            if(sortConfig.zero && item.balance === 0) {
                return false;
            }

            if(sortConfig.deposited && item.deposited === 0) {
                return false;
            }

            if(sortConfig.boost && !item.boost) {
                return false;
            }

            if(sortConfig.experimental && !item.experimental) {
                return false;
            }

            if(sortConfig.platform !== 'all' && (isEmpty(item.platform) || sortConfig.platform !== (item.platform).toLowerCase())) {
                return false;
            }

            if(sortConfig.vault !== 'all' && sortConfig.vault !== item.vaultType) {
                return false;
            }

            if(sortConfig.blockchain !== 'all' && item.network !== sortConfig.blockchain) {
                return false;
            }

            return item;
        }

        for (const [, item] of Object.entries(vault.pools)) {
            if(check(item)) {
                data.push(item);
            }
        }

        if (sortConfig !== null) {
            data = sorted(data);
        }

        setVaultCount({ showing: data.length, total: Object.entries(vault.pools).length });
        setFiltered(data);
        setScrollable(scrollable => {
            return {...scrollable, ...{items: data.slice(0, scrollable.chunk), hasMore: data.length > scrollable.chunk}}
        });

    }, [sortConfig, vault.pools]);

    const fetchScrollable = () => {
        if (scrollable.items.length >= filtered.length) {
            setScrollable({ ...scrollable, hasMore: false });
            return;
        }

        const visible = scrollable.items.length;
        setScrollable({
            ...scrollable,
            items: scrollable.items.concat(filtered.slice(visible, visible + scrollable.chunk)),
        });
    };

    React.useEffect(() => {
        if(wallet.address && vault.lastUpdated > 0) {
            dispatch(reduxActions.balance.fetchBalances());
        }
    }, [dispatch, wallet.address, vault.lastUpdated]);

    React.useEffect(() => {
        if(prices.lastUpdated > 0) {
            dispatch(reduxActions.vault.fetchPools());
        }
    }, [dispatch, prices.lastUpdated]);

    React.useEffect(() => {
        setInterval(() => {
            dispatch(reduxActions.vault.fetchPools());
        }, 60000);
    }, [dispatch]);

    return (
        <React.Fragment>
            <Portfolio />
            <Container fixed>
                <Box className={classes.header}>
                    <Box className={classes.h1}>Vaults</Box>
                    <Box className={classes.tvl}>
                        <Box className={classes.tvlLabel}>TVL: </Box>
                        <Box className={classes.tvlValue}>{formatTvl(vault.totalTvl)}</Box>
                    </Box>
                </Box>
                {vault.isPoolsLoading ? (
                    <Loader message={('Loading data from blockchain...')} />
                ) : (
                <Box>
                    <Filter sortConfig={sortConfig} setSortConfig={setSortConfig} defaultFilter={defaultFilter} platforms={vault.platforms} vaultCount={vaultCount} />
                    <Box className={classes.numberOfVaults}>
                        Showing {vaultCount.showing} vaults
                    </Box>
                    {isEmpty(filtered) ? '' : (
                        <InfiniteScroll dataLength={scrollable.items.length} hasMore={scrollable.hasMore} next={fetchScrollable} loader={"loading..."}>
                            {scrollable.items.map(item => (
                            <Item key={item.id} item={item} />
                            ))}
                        </InfiniteScroll>
                    )}
                </Box>
                )}
            </Container>
        </React.Fragment>
    );
};

export default Home;
