import * as React from "react";
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {BigNumber} from 'bignumber.js';
import {formatDecimals, formatApy, calcDaily, formatTvl} from '../../helpers/format'
import reduxActions from "../redux/actions";

import {Button, Container, Hidden, Avatar, Grid, makeStyles, Typography} from "@material-ui/core"
import Box from '@material-ui/core/Box';
import Filter from './components/Filter';
import ListHeaderBtn from './components/ListHeaderBtn';
import Portfolio from './components/Portfolio';
import styles from "./styles"
import Loader from "../../components/loader";

let currentNetwork;
const useStyles = makeStyles(styles);
const defaultFilter = {
    key: 'tvl',
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

const UseSortableData = (items, config = null) => {
    const storage = localStorage.getItem('homeSortConfig');
    const [sortConfig, setSortConfig] = React.useState(storage === null ? config : JSON.parse(storage));

    React.useEffect(() => {
        localStorage.setItem('homeSortConfig', JSON.stringify(sortConfig));
    }, [sortConfig]);

    const sortedItems = React.useMemo(() => {
        let sortableItems = Object.keys(items).length === 0 ? [] : [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
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
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key, d = false) => {
        const direction = d ? d : (
            (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') ? 'asc' : 'desc'
        );

        setSortConfig({ ...sortConfig, key, direction });
    };

    const setFilter = (obj) => {
        setSortConfig({ ...sortConfig, ...obj});
    }

    return { items: sortedItems, requestSort, sortConfig, setFilter};
};

const Vault = () => {
    const dispatch = useDispatch();
    const {vault, wallet} = useSelector(state => ({
        vault: state.vaultReducer,
        wallet: state.walletReducer,
    }));

    const history = useHistory();
    const classes = useStyles();
    const {items, requestSort, sortConfig, setFilter} = UseSortableData(vault.pools, defaultFilter);

    React.useEffect(() => {
        requestSort(sortConfig.key, sortConfig.direction);
    }, [vault.lastUpdated]);

    React.useEffect(() => {
        if(currentNetwork !== wallet.network) {
            dispatch(reduxActions.vault.fetchPools());
            dispatch(reduxActions.wallet.fetchRpc());
            dispatch(reduxActions.vault.fetchPoolsData());
            currentNetwork = wallet.network;
        }
    }, [dispatch, wallet.network]);

    React.useEffect(() => {
        setInterval(() => {
            dispatch(reduxActions.vault.fetchPoolsData());
        }, 60000);
    }, [dispatch]);

    const filter = () => {
        if(items.length > 0) {
            return items.filter((item) => {
                return item.status === (sortConfig.retired ? 'eol' : 'active') && item.name.toLowerCase().includes(sortConfig.keyword) ? item : false;
            });
        }
        return false;
    };

    const processItem = (get, item) => {
        let obj = [classes.item]
        let msg = '';

        if(item.status === 'active' && item.depositsPaused) {
            obj.push(classes.itemPaused);
            msg = item.statusMessage ? item.statusMessage : 'Deposit Paused';
        }

        if(item.status === 'eol') {
            obj.push(classes.itemRetired);
            msg = item.statusMessage ? item.statusMessage : 'Vault Retired';
        }

        switch(get) {
            case 'classes':
                return obj.join(' ');
            case 'message':
                return msg ? <Grid className={classes.itemMessage}>{msg}</Grid> : '';
            default:
                return;
        }
    }

    return (
        <React.Fragment>
            <Portfolio />
            <Container maxWidth="xl">
                <Typography className={classes.tvl} align={'right'} style={{float: 'right'}}>TVL: {formatTvl(vault.totalTvl)}</Typography>
                <Typography className={classes.h1}>Vaults</Typography>
                {vault.isPoolsLoading ? (
                    <Loader message={('Loading data from ' + (wallet.network).toUpperCase() + ' network...')} />
                ) : (
                <Box>
                    <Filter sortConfig={sortConfig} setFilter={setFilter} defaultFilter={defaultFilter} />
                    <Box>
                        Showing 125 vaults
                    </Box>
                    {items.length === 0 ? '' : (
                        filter().map(item => (
                            <Grid container key={item.id}>
                                <Button className={processItem('classes', item)} onClick={() => {history.push('/' + wallet.network + '/vault/' + (item.id))}}>
                                    <Box flexGrow={1} textAlign={"left"}>
                                        {processItem('message', item)}
                                        <Grid container>
                                            <Hidden smDown>
                                                <Grid>
                                                    <Avatar alt={item.name} src={require('../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                                                </Grid>
                                            </Hidden>
                                            <Grid>
                                                <Box textAlign={"left"} style={{paddingLeft:"16px"}}>
                                                    <Typography className={classes.h2}>{item.name}</Typography>
                                                    <Typography className={classes.h3}>{item.tokenDescription}</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Box className={classes.rWidth} textAlign={"right"}>
                                        <Typography className={classes.h2}>{formatDecimals(new BigNumber(item.balance))}</Typography>
                                    </Box>
                                    <Box className={classes.rWidth} textAlign={"right"}>
                                        <Typography className={classes.h2}>{formatDecimals(new BigNumber(item.deposited))}</Typography>
                                    </Box>
                                    <Box className={classes.rWidth} textAlign={"right"}>
                                        <Typography className={classes.h2}>{formatApy(item.apy)}</Typography>
                                    </Box>
                                    <Hidden mdDown>
                                        <Box className={classes.rWidth} textAlign={"right"}>
                                            <Typography className={classes.h2}>{calcDaily(item.apy)}</Typography>
                                        </Box>
                                    </Hidden>
                                    <Box className={classes.rWidth} textAlign={"right"}>
                                        <Typography className={classes.h2}>{formatTvl(item.tvl)}</Typography>
                                    </Box>
                                </Button>
                            </Grid>
                        ))
                    )}

                </Box>
                )}
            </Container>
        </React.Fragment>
    );
};

export default Vault;
