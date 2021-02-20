import * as React from "react";
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import {BigNumber} from 'bignumber.js';
import {formatDecimals, formatApy, calcDaily} from '../../helpers/format'

import {Button, Container, Hidden, Avatar, Grid, makeStyles, Typography} from "@material-ui/core"
import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import styles from "./styles"

const useStyles = makeStyles(styles);

const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = React.useState(config);

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
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

const Vault = () => {
    const history = useHistory();
    const classes = useStyles();
    const wallet = useSelector(state => state.wallet);
    const {items, requestSort, sortConfig} = useSortableData(wallet.poolsFormatted);

    const ListHeaderBtn = (prop) => {
        let obj = [classes.listHeaderBtnArrow]

        if(sortConfig && sortConfig.key === prop.sort) {
            obj.push(sortConfig.direction === 'descending' ? classes.listHeaderBtnDesc : classes.listHeaderBtnAsc)
        }

        return (<Button className={classes.listHeaderBtn} disableRipple onClick={() => requestSort(prop.sort)}>
                    {prop.name}
                    <Box className={obj.join(' ')} />
                </Button>
        )
    };

    return (
        <Container maxWidth="lg">
            <Box p={{ xs: 2, sm: 3, md: 4, xl: 6 }} align="center">
                <Alert severity="warning">Using Smart Contracts, Tokens, and Crypto is always a risk. DYOR before investing.</Alert>
            </Box>
            <Box>
                <Grid container className={classes.listHeader}>
                    <Box flexGrow={1} textAlign={"left"}>
                        <ListHeaderBtn name="Name" sort="name" />
                    </Box>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="Balance" sort="balance" />
                    </Box>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="Deposited" sort="deposited" />
                    </Box>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="APY%" sort="apy" />
                    </Box>
                    <Hidden mdDown>
                        <Box className={classes.rWidth} textAlign={"right"}>
                            <ListHeaderBtn name="Daily APY%" sort="daily" />
                        </Box>
                    </Hidden>
                    <Box className={classes.rWidth} textAlign={"right"}>
                        <ListHeaderBtn name="TVL" sort="tvl" />
                    </Box>
                </Grid>
                {items.map((item) => (
                <Grid container key={item.id}>
                    <Button className={classes.item} onClick={() => {history.push('/vault/' + wallet.network + '/' + (item.id))}}>
                        <Box flexGrow={1} textAlign={"left"}>
                            <Grid container>
                                <Hidden smDown>
                                    <Grid>
                                        <Avatar alt={item.name} src={require('../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                                    </Grid>
                                </Hidden>
                                <Grid>
                                    <Box textAlign={"left"} style={{paddingLeft:"8px"}}>
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
