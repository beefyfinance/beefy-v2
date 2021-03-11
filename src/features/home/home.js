import * as React from "react";
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import {BigNumber} from 'bignumber.js';
import {formatDecimals, formatApy, calcDaily} from '../../helpers/format'

import {Button, Container, Hidden, Avatar, Grid, makeStyles, Typography} from "@material-ui/core"
import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Filter from './components/Filter';
import ListHeaderBtn from './components/ListHeaderBtn';
import styles from "./styles"

const useStyles = makeStyles(styles);

const UseSortableData = (items, config = null) => {
    const storage = localStorage.getItem('homeSortConfig');
    const [sortConfig, setSortConfig] = React.useState(storage === null ? config : JSON.parse(storage));

    React.useEffect(() => {
        localStorage.setItem('homeSortConfig', JSON.stringify(sortConfig));
    }, [sortConfig]);

    const sortedItems = React.useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'descending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ ...sortConfig, key, direction });
    };

    const setRetired = () => {
        const val = !sortConfig.retired;
        setSortConfig({ ...sortConfig, retired: val});
    }

    const setKeyword = (keyword) => {
        setSortConfig({ ...sortConfig, keyword: keyword});
    }

    return { items: sortedItems, requestSort, sortConfig, setRetired, setKeyword};
};

const Vault = () => {
    const history = useHistory();
    const classes = useStyles();
    const wallet = useSelector(state => state.wallet);
    const {items, requestSort, sortConfig, setRetired, setKeyword} = UseSortableData(wallet.poolsFormatted, {
        retired: false,
        key: 'tvl',
        direction: 'descending',
        keyword: ''
    });

    const filter = () => {
        return items.filter((item) => {
            return item.status === (sortConfig.retired ? 'eol' : 'active') && item.name.toLowerCase().includes(sortConfig.keyword) ? item : false;
        });
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
        <Container maxWidth="lg">
            <Box p={{ xs: 2, sm: 3, md: 4, xl: 6 }} align="center">
                <Alert severity="warning">Using Smart Contracts, Tokens, and Crypto is always a risk. DYOR before investing.</Alert>
            </Box>
            <Filter sortConfig={sortConfig} setKeyword={setKeyword} setRetired={setRetired} />
            <Box>
                <Grid container className={classes.listHeader}>
                    <Box flexGrow={1} textAlign={"left"}>
                        <ListHeaderBtn name="Name" sort="name" sortConfig={sortConfig} requestSort={requestSort} />
                    </Box>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="Balance" sort="balance" sortConfig={sortConfig} requestSort={requestSort} />
                    </Box>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="Deposited" sort="deposited" sortConfig={sortConfig} requestSort={requestSort} />
                    </Box>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="APY%" sort="apy" sortConfig={sortConfig} requestSort={requestSort} />
                    </Box>
                    <Hidden mdDown>
                        <Box className={classes.rWidth} textAlign={"right"}>
                            <ListHeaderBtn name="Daily APY%" sort="daily" sortConfig={sortConfig} requestSort={requestSort} />
                        </Box>
                    </Hidden>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="TVL" sort="tvl" sortConfig={sortConfig} requestSort={requestSort} />
                    </Box>
                </Grid>
                {filter().map(item => (
                <Grid container key={item.id}>
                    <Button className={processItem('classes', item)} onClick={() => {history.push('/vault/' + wallet.network + '/' + (item.id))}}>
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
                                <Typography className={classes.h2}>{calcDaily(item.daily)}</Typography>
                            </Box>
                        </Hidden>
                        <Box className={classes.rWidth} textAlign={"right"}>
                            <Typography className={classes.h2}>${(item.tvl)}</Typography>
                        </Box>
                    </Button>
                </Grid>
                ))}
            </Box>
        </Container>
    );
};

export default Vault;
