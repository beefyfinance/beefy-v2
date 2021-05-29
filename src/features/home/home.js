import * as React from "react";
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {formatApy, calcDaily, formatTvl} from '../../helpers/format'
import reduxActions from "../redux/actions";

import {Button, Container, Hidden, Avatar, Grid, makeStyles, Typography} from "@material-ui/core"
import Box from '@material-ui/core/Box';
import Filter from './components/Filter';
import Portfolio from './components/Portfolio';
import styles from "./styles"
import Loader from "../../components/loader";
import {isEmpty} from "../../helpers/utils";

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

const UseSortableData = (items, config = null) => {
    const storage = localStorage.getItem('homeSortConfig');
    const [sortConfig, setSortConfig] = React.useState(storage === null ? config : JSON.parse(storage));

    React.useEffect(() => {
        localStorage.setItem('homeSortConfig', JSON.stringify(sortConfig));
    }, [sortConfig]);

    const sortedItems = React.useMemo(() => {
        let sortableItems = isEmpty(items) ? [] : [...items];
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

    const setFilter = (obj) => {
        setSortConfig({ ...sortConfig, ...obj});
    }

    return { items: sortedItems, sortConfig, setFilter};
};

const Vault = () => {
    const dispatch = useDispatch();
    const {vault, wallet} = useSelector(state => ({
        vault: state.vaultReducer,
        wallet: state.walletReducer,
    }));

    const history = useHistory();
    const classes = useStyles();
    const {items, sortConfig, setFilter} = UseSortableData(vault.pools, defaultFilter);
    const [vaultCount, setVaultCount] = React.useState({showing: 0, total: 0});

    React.useEffect(() => {
        dispatch(reduxActions.wallet.fetchRpc());
        dispatch(reduxActions.vault.fetchPools());
    }, [dispatch]);

    React.useEffect(() => {
        setInterval(() => {
            dispatch(reduxActions.vault.fetchPoolsData());
        }, 60000);
    }, [dispatch]);

    const filter = () => {
        if(items.length > 0) {
            if(vaultCount.total !== items.length) {
                setVaultCount({ ...vaultCount, total: items.length });
            }

            const filtered = items.filter((item) => {
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
            });

            if(vaultCount.showing !== filtered.length) {
                setVaultCount({ ...vaultCount, showing: filtered.length });
            }

            return filtered;
        }
        return false;
    };

    const DisplayTags = ({tags}) => {
        const getText = (name) => {
            switch(name) {
                case 'low':
                    return 'Low Risk';
                case 'recent':
                    return 'New';
                default:
                    return name;
            }
        }

        return (
            tags.map(item => (
                <Typography className={[classes.tags, classes[item + 'Tag']].join(' ')} display={'inline'} key={item}>{getText(item)}</Typography>
            ))
        );
    }

    return (
        <React.Fragment>
            <Portfolio />
            <Container maxWidth="xl">
                <Typography className={classes.tvl} align={'right'} style={{float: 'right'}}>TVL: {formatTvl(vault.totalTvl)}</Typography>
                <Typography className={classes.h1}>Vaults</Typography>
                {vault.isPoolsLoading ? (
                    <Loader message={('Loading data from blockchain...')} />
                ) : (
                <Box>
                    <Filter sortConfig={sortConfig} setFilter={setFilter} defaultFilter={defaultFilter} platforms={vault.platforms} vaultCount={vaultCount} />
                    <Box className={classes.numberOfVaults}>
                        Showing {vaultCount.showing} vaults
                    </Box>
                    {items.length === 0 ? '' : (
                        filter().map(item => (
                            <Grid container key={item.id}>
                                <Button className={[classes.item, classes.roundedLeft, classes.roundedRight].join(' ')} onClick={() => {history.push('/' + wallet.network + '/vault/' + (item.id))}}>
                                    <Box flexGrow={1} textAlign={"left"}>
                                        <Grid className={classes.infoContainer} container>
                                            <Hidden smDown>
                                                <Grid>
                                                    <Avatar alt={item.name} src={require('../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                                                </Grid>
                                            </Hidden>
                                            <Grid>
                                                <Box className={classes.title} textAlign={"left"}>
                                                    <Typography className={classes.h2}>{item.name}</Typography>
                                                    <Box>
                                                        <Typography display={"inline"}><img alt={item.network} src={require('../../images/networks/' + item.network + '.svg').default} /></Typography>
                                                        <DisplayTags tags={item.tags} />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Box className={classes.rWidth} textAlign={"left"}>
                                        <Typography className={classes.h2}>{item.riskScore}</Typography>
                                        <Typography className={classes.h3}>Beefy risk score</Typography>
                                    </Box>
                                    <Box className={classes.rWidth} textAlign={"left"}>
                                        <Typography className={classes.h2}>{formatTvl(item.tvl)}</Typography>
                                        <Typography className={classes.h3}>TVL</Typography>
                                    </Box>
                                    <Hidden mdDown>
                                        <Box className={classes.rWidth} textAlign={"left"}>
                                            <Typography className={classes.h2}>{calcDaily(item.apy)}</Typography>
                                            <Typography className={classes.h3}>Daily</Typography>
                                        </Box>
                                    </Hidden>
                                    <Hidden mdDown>
                                        <Box className={classes.rWidth} textAlign={"left"}>
                                            <Typography className={classes.h2}>[chart]</Typography>
                                            <Typography className={classes.h3}>Daily historical rate</Typography>
                                        </Box>
                                    </Hidden>
                                    <Box className={[classes.rWidth, classes.apyBg, classes.roundedRight, classes.apyContainer].join(' ')} textAlign={"center"}>
                                        <Typography variant={"h1"}>{formatApy(item.apy)}</Typography>
                                        <Typography variant={"h2"}>APY</Typography>
                                        <Typography variant={"button"}>Deposit</Typography>
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
