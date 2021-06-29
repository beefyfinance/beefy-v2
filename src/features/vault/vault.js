import * as React from "react";
import {useParams} from "react-router";
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import Loader from "../../components/loader";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,} from "recharts";
import {Container, makeStyles, Grid, Paper, Typography, Box, Avatar, Button, Divider, Hidden} from "@material-ui/core"
import styles from "./styles"
import {calcDaily, formatApy, formatTvl} from "../../helpers/format";
import {isEmpty} from "../../helpers/utils";
import DisplayTags from "../../components/vaultTags";
import {ArrowLeft} from "@material-ui/icons";
import reduxActions from "../redux/actions";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import TokenInfo from "./components/TokenInfo";
import StrategyInfo from "./components/StrategyInfo";
import RiskInfo from "./components/RiskInfo";

const useStyles = makeStyles(styles);
const chartData = [
    { name: "28 Jan", apy: 45.00 },
    { name: "4 Feb", apy: 57.15 },
    { name: "11 Feb", apy: 38.50 },
    { name: "18 Feb", apy: 41.37 }
];

const Vault = () => {
    const history = useHistory();
    const classes = useStyles();

    let { id } = useParams();
    const {vault, wallet, prices} = useSelector(state => ({
        vault: state.vaultReducer,
        wallet: state.walletReducer,
        prices: state.pricesReducer,
    }));
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = React.useState(true);
    const [item, setVaultData] = React.useState(null);
    const [dw, setDw] = React.useState('deposit');
    const [formData, setFormData] = React.useState({deposit: {amount: '', max: false}, withdraw: {amount: '', max: false}});

    const handleWalletConnect = () => {
        if(!wallet.address) {
            dispatch(reduxActions.wallet.connect());
        }
    }

    const updateItemData = () => {
        if(wallet.address && item) {
            dispatch(reduxActions.vault.fetchPools(item));
            dispatch(reduxActions.balance.fetchBalances(item));
        }
    }

    const resetFormData = () => {
        setFormData({deposit: {amount: '', max: false}, withdraw: {amount: '', max: false}});
    }

    React.useEffect(() => {
        if(!isEmpty(vault.pools) && vault.pools[id]) {
            setVaultData(vault.pools[id]);
        } else {
            history.push('/error');
        }
    }, [vault.pools, id, history]);

    React.useEffect(() => {
        if(item) {
            setIsLoading(false);
        }
    }, [item]);

    React.useEffect(() => {
        if(item && prices.lastUpdated > 0) {
            dispatch(reduxActions.vault.fetchPools(item));
        }
    }, [dispatch, item, prices.lastUpdated]);

    React.useEffect(() => {
        if(item && wallet.address) {
            dispatch(reduxActions.balance.fetchBalances(item));
        }
    }, [dispatch, item, wallet.address]);

    React.useEffect(() => {
        if(item) {
            setInterval(() => {
                dispatch(reduxActions.vault.fetchPools(item));
                dispatch(reduxActions.balance.fetchBalances(item));
            }, 60000);
        }
    }, [item, dispatch]);

    return (
        <Container className={classes.vaultContainer} maxWidth="xl">
            {isLoading ? (
                <Loader message="Getting vault data..." />
            ) : (
                <Grid container style={{position: 'relative'}}>
                    <Grid item xs={12} md={8} lg={9}>
                        <Button className={classes.btnGoBack} onClick={() => {history.push('/')}}><ArrowLeft /> Back to Explore</Button>
                        <Grid className={classes.title} container>
                            <Grid>
                                <Avatar className={classes.large} alt={item.name} src={require('../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                            </Grid>
                            <Grid>
                                <Typography variant={"h1"}>{item.name} vault</Typography>
                            </Grid>
                        </Grid>
                        <Box className={classes.mobileFix} display="flex" alignItems="center">
                            <Box display={"flex"} alignItems="center">
                                <Box lineHeight={0}>
                                    <img alt={item.network} src={require('../../images/networks/' + item.network + '.svg').default} />
                                </Box>
                                <Box pl={1}>
                                    <Typography className={classes.network} display={"inline"}>{item.network} network</Typography>
                                </Box>
                                <Box pl={1}>
                                    <DisplayTags tags={item.tags} />
                                </Box>
                            </Box>
                            <Box className={classes.summaryContainer} display={"flex"} alignItems="center">
                                <Hidden xsDown>
                                    <Box>
                                        <Divider />
                                    </Box>
                                </Hidden>
                                <Box>
                                    <Typography variant={"h1"}>{formatTvl(item.tvl)}</Typography>
                                    <Typography variant={"body2"}>TVL</Typography>
                                </Box>
                                <Box>
                                    <Divider />
                                </Box>
                                <Box>
                                    <Typography variant={"h1"}>{calcDaily(item.apy)}</Typography>
                                    <Typography variant={"body2"}>Daily</Typography>
                                </Box>
                                <Box>
                                    <Divider />
                                </Box>
                                <Box>
                                    <Typography variant={"h1"}>{formatApy(item.apy)}</Typography>
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
                                <Deposit
                                    item={item}
                                    handleWalletConnect={handleWalletConnect}
                                    formData={formData}
                                    setFormData={setFormData}
                                    updateItemData={updateItemData}
                                    resetFormData={resetFormData}
                                />
                            ) : (
                                <Withdraw
                                    item={item}
                                    handleWalletConnect={handleWalletConnect}
                                    formData={formData}
                                    setFormData={setFormData}
                                    updateItemData={updateItemData}
                                    resetFormData={resetFormData}
                                />
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
                        <RiskInfo />
                        <StrategyInfo 
                            description={`The strategy deposits the LP token on Pancake Swap and farms CAKE. The CAKE
                             is sold to buy more Badger-BUSD LP and redeposited in the vault. The gas price is socialized 
                             between all vault users and the compound happens automatically. APY breakdown`}
                            stratAddr="#"
                            vaultAddr="#"
                        />
                        <TokenInfo token={{
                              symbol: "BUSD",
                              website: "#",
                              tokenAddress: "#",
                              description: `Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in
                                partnership with Paxos), Approved and regulated by the New York State Department
                                of Financial Services (NYDFS), The BUSD Monthly Audit Report can be viewed from
                                the official website.`
                        }}/>
                        <TokenInfo token={{
                              symbol: "BADGER",
                              website: "#",
                              tokenAddress: "#",
                              description: `Badger DAO is an open-source, decentralized automated organization that is 
                                dedicated to building products and infrastructure of simplifying the use of Bitcoin (BTC) 
                                as collateral across many smart contract platforms.`
                        }}/>

                    </Grid>
                </Grid>
            )}
        </Container>
    )
};

export default Vault;
