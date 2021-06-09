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
    Button, IconButton, InputBase, Divider, Hidden
} from "@material-ui/core"
import styles from "./styles"
import {calcDaily, formatApy, formatTvl} from "../../helpers/format";
import {isEmpty} from "../../helpers/utils";
import DisplayTags from "../../components/vaultTags";
import {ArrowLeft, HelpOutline, ShoppingBasket} from "@material-ui/icons";

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
    const [dw, setDw] = React.useState('deposit');

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
                        <Button className={classes.btnGoBack} onClick={() => {history.goBack()}}><ArrowLeft /> Back to Explore</Button>
                        <Grid className={classes.title} container>
                            <Grid>
                                <Avatar className={classes.large} alt={vault.name} src={require('../../images/' + vault.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                            </Grid>
                            <Grid>
                                <Typography variant={"h1"}>{vault.name} vault</Typography>
                            </Grid>
                        </Grid>
                        <Box className={classes.mobileFix} display="flex" alignItems="center">
                            <Box display={"flex"} alignItems="center">
                                <Box lineHeight={0}>
                                    <img alt={vault.network} src={require('../../images/networks/' + vault.network + '.svg').default} />
                                </Box>
                                <Box pl={1}>
                                    <Typography className={classes.network} display={"inline"}>{vault.network} network</Typography>
                                </Box>
                                <Box pl={1}>
                                    <DisplayTags tags={vault.tags} />
                                </Box>
                            </Box>
                            <Box className={classes.summaryContainer} display={"flex"} alignItems="center">
                                <Hidden xsDown>
                                    <Box>
                                        <Divider />
                                    </Box>
                                </Hidden>
                                <Box>
                                    <Typography variant={"h1"}>{formatTvl(vault.tvl)}</Typography>
                                    <Typography variant={"body2"}>TVL</Typography>
                                </Box>
                                <Box>
                                    <Divider />
                                </Box>
                                <Box>
                                    <Typography variant={"h1"}>{calcDaily(vault.apy)}</Typography>
                                    <Typography variant={"body2"}>Daily</Typography>
                                </Box>
                                <Box>
                                    <Divider />
                                </Box>
                                <Box>
                                    <Typography variant={"h1"}>{formatApy(vault.apy)}</Typography>
                                    <Typography variant={"body2"}>APY</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4} lg={3} className={classes.customOrder}>
                        <Box className={classes.dw}>
                            <Box className={classes.tabs}>
                                <Button onClick={() => setDw('deposit')} className={dw === 'deposit' ? classes.selected : ''}>Deposit</Button>
                                <Button onClick={() => setDw('withdraw')} className={dw === 'withdraw' ? classes.selected : ''}>Withdraw</Button>
                            </Box>
                            {dw === 'deposit' ? (
                                <React.Fragment>
                                    <Box p={3}>
                                        <Typography className={classes.balanceText}>Balance:</Typography>
                                        <Box className={classes.balanceContainer} display="flex" alignItems="center">
                                            <Box lineHeight={0}>
                                                <img alt={vault.name} src={require('../../images/' + vault.logo).default} />
                                            </Box>
                                            <Box flexGrow={1} pl={1}>
                                                <Typography variant={"body1"}>{vault.balance} {vault.token}</Typography>
                                            </Box>
                                            <Box>
                                                <Button endIcon={<ShoppingBasket />}>Buy Token</Button>
                                            </Box>
                                        </Box>
                                        <Box className={classes.inputContainer}>
                                            <Paper component="form" className={classes.root}>
                                                <Box className={classes.inputLogo}>
                                                    <img alt={vault.name} src={require('../../images/' + vault.logo).default} />
                                                </Box>
                                                <InputBase className={classes.input} placeholder="0.00" />
                                                <Button>Max</Button>
                                            </Paper>
                                        </Box>
                                        <Box mt={2} p={2} className={classes.feeContainer}>
                                            <Grid container>
                                                <Grid item xs={12}>
                                                    <IconButton style={{float: 'right'}}><HelpOutline /></IconButton>
                                                    <Typography variant={"h1"}>Beefy Fee:</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant={"h2"}>0.7% (0.07)</Typography>
                                                    <Typography>Deposit fee</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant={"h2"}>0%</Typography>
                                                    <Typography>Withdrawal fee</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box pt={1}>
                                                        <Typography>Performance fees are already subtracted from the displayed APY.</Typography>
                                                    </Box>
                                                    <Divider />
                                                    <Typography variant={"h1"}>Est. Transaction Costs:</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant={"h2"}>~0.05 BNB ($0.1)</Typography>
                                                    <Typography>Deposit</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant={"h2"}>~0.05 BNB ($0.1)</Typography>
                                                    <Typography>Withdrawal</Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        <Box mt={2}>
                                            <Button className={classes.btnSubmit} fullWidth={true}>Deposit</Button>
                                        </Box>
                                    </Box>
                                    <Box p={1}>
                                        <Box p={3} className={classes.boostContainer}>
                                            <Box display="flex" alignItems="center">
                                                <Box lineHeight={0}>
                                                    <img alt={vault.name} src={require('../../images/fire.png').default} />
                                                </Box>
                                                <Box>
                                                    <Typography variant={"h1"}>Boost</Typography>
                                                </Box>
                                                <Box>
                                                    <IconButton><HelpOutline /></IconButton>
                                                </Box>
                                                <Box flexGrow={1}>
                                                    <Typography variant={"h2"} align={"right"}>0</Typography>
                                                </Box>
                                            </Box>
                                            <Typography align={"right"}>Receipt Token balance</Typography>
                                            <Box pt={4}>
                                                <Button disabled={true} className={classes.btnSubmit} fullWidth={true}>Stake Receipt Token</Button>
                                            </Box>
                                        </Box>

                                    </Box>
                                </React.Fragment>
                            ) : (
                                <Box>
                                    <React.Fragment>
                                        <Box p={3}>
                                            <Typography className={classes.balanceText}>Deposited:</Typography>
                                            <Box className={classes.balanceContainer} display="flex" alignItems="center">
                                                <Box lineHeight={0}>
                                                    <img alt={vault.name} src={require('../../images/' + vault.logo).default} />
                                                </Box>
                                                <Box flexGrow={1} pl={1}>
                                                    <Typography variant={"body1"}>{vault.balance} {vault.token}</Typography>
                                                </Box>
                                                <Box>
                                                    <Button endIcon={<ShoppingBasket />}>Buy Token</Button>
                                                </Box>
                                            </Box>
                                            <Box className={classes.inputContainer}>
                                                <Paper component="form" className={classes.root}>
                                                    <Box className={classes.inputLogo}>
                                                        <img alt={vault.name} src={require('../../images/' + vault.logo).default} />
                                                    </Box>
                                                    <InputBase className={classes.input} placeholder="0.00" />
                                                    <Button>Max</Button>
                                                </Paper>
                                            </Box>
                                            <Box mt={2} p={2} className={classes.feeContainer}>
                                                <Grid container>
                                                    <Grid item xs={12}>
                                                        <IconButton style={{float: 'right'}}><HelpOutline /></IconButton>
                                                        <Typography variant={"h1"}>Beefy Fee:</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant={"h2"}>0.7% (0.07)</Typography>
                                                        <Typography>Deposit fee</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant={"h2"}>0%</Typography>
                                                        <Typography>Withdrawal fee</Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Box pt={1}>
                                                            <Typography>Performance fees are already subtracted from the displayed APY.</Typography>
                                                        </Box>
                                                        <Divider />
                                                        <Typography variant={"h1"}>Est. Transaction Costs:</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant={"h2"}>~0.05 BNB ($0.1)</Typography>
                                                        <Typography>Deposit</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant={"h2"}>~0.05 BNB ($0.1)</Typography>
                                                        <Typography>Withdrawal</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                            <Box mt={2}>
                                                <Button className={classes.btnSubmit} fullWidth={true}>Withdraw</Button>
                                            </Box>
                                        </Box>
                                        <Box p={1}>
                                            <Box p={3} className={classes.boostContainer}>
                                                <Box display="flex" alignItems="center">
                                                    <Box lineHeight={0}>
                                                        <img alt={vault.name} src={require('../../images/fire.png').default} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant={"h1"}>Boost</Typography>
                                                    </Box>
                                                    <Box>
                                                        <IconButton><HelpOutline /></IconButton>
                                                    </Box>
                                                    <Box flexGrow={1}>
                                                        <Typography variant={"h2"} align={"right"}>0</Typography>
                                                    </Box>
                                                </Box>
                                                <Typography align={"right"}>Receipt Token balance</Typography>
                                                <Box pt={4}>
                                                    <Button disabled={true} className={classes.btnSubmit} fullWidth={true}>Unstake Receipt Token</Button>
                                                </Box>
                                            </Box>

                                        </Box>
                                    </React.Fragment>
                                </Box>
                            )}
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
