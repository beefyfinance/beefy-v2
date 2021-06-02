import * as React from "react";
import {useParams} from "react-router";
import {useHistory} from "react-router-dom";
import {useSelector} from "react-redux";
import Loader from "../../components/loader";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Container,
    makeStyles,
    Grid,
    Paper,
    Typography,
    Box,
    Avatar,
    Button
} from "@material-ui/core"
import styles from "./styles"
import {calcDaily, formatApy, formatTvl} from "../../helpers/format";
import {isEmpty} from "../../helpers/utils";
import DisplayTags from "../../components/vaultTags";

const useStyles = makeStyles(styles);
const chartData = [
    { name: "28 Jan", apy: 45.00 },
    { name: "4 Feb", apy: 57.15 },
    { name: "11 Feb", apy: 38.50 },
    { name: "18 Feb", apy: 41.37 }
];

const getVault = (pools, id) => {
    if(isEmpty(pools)) {
        return false;
    }
    for(let key in pools) {
        if(pools[key].id === id) {
            return {match: true, pool: pools[key]};
        }
    }
    return {match: false, pool: null};
}

const Vault = () => {
    const history = useHistory();
    const classes = useStyles();

    let { id } = useParams();
    const vaultReducer = useSelector(state => state.vaultReducer);
    const [isLoading, setIsLoading] = React.useState(true);
    const [vault, setVaultData] = React.useState(null);

    React.useEffect(() => {
        const resp = getVault(vaultReducer.pools, id);
        if(resp) {
            resp.match ? setVaultData(resp.pool) : history.push('/error');
        }
    }, [vaultReducer.pools, id, history]);

    React.useEffect(() => {
        if(vault) {
            setIsLoading(false);
        }
    }, [vault]);

    return (
        <Container className={classes.vaultContainer} maxWidth="xl">
            {isLoading ? (
                <Loader message="Getting vault data..." />
            ) : (
                <Grid container style={{position: 'relative'}}>
                    <Grid item xs={12} md={8} lg={9}>
                        <Button variant="outlined" onClick={() => {history.goBack()}}>Back to Explore</Button>
                        <Grid className={classes.title} container>
                            <Grid>
                                <Avatar className={classes.large} alt={vault.name} src={require('../../images/' + vault.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                            </Grid>
                            <Grid>
                                <Typography variant={"h1"}>{vault.name} vault</Typography>
                            </Grid>
                        </Grid>
                        <Box display="flex" alignItems="center" p={1} m={1}>
                            <Box>
                                <img alt={vault.network} src={require('../../images/networks/' + vault.network + '.svg').default} />
                            </Box>
                            <Box pl={1}>
                                <Typography className={classes.network} display={"inline"}>{vault.network} network</Typography>
                            </Box>
                            <Box pl={1}>
                                <DisplayTags tags={vault.tags} />
                            </Box>
                            <Box pl={1}>
                                <Typography>{formatTvl(vault.tvl)}</Typography>
                                <Typography>TVL</Typography>
                            </Box>
                            <Box pl={1}>
                                <Typography>{calcDaily(vault.apy)}</Typography>
                                <Typography>Daily</Typography>
                            </Box>
                            <Box pl={1}>
                                <Typography>{formatApy(vault.apy)}</Typography>
                                <Typography>APY</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3} className={classes.customOrder}>
                        <Box className={classes.dw}>
                            <Button>Deposit</Button> <Button>Withdraw</Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8} lg={9}>
                        <Paper className={classes.paper}>
                            <Typography>Historical rate</Typography>
                            <Box style={{height: 250}}>
                                <ResponsiveContainer>
                                    <LineChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 5}}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="apy" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>

                        </Paper>
                        <Paper className={classes.paper}>
                            <Typography>Projected yield</Typography>
                        </Paper>
                        <Paper className={classes.paper}>
                            <Typography>Risk</Typography>
                        </Paper>
                        <Paper className={classes.paper}>
                            <Typography>Strategy</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    )
};

export default Vault;
