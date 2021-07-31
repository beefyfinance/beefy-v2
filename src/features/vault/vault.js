import * as React from "react";
import {addressBook} from "blockchain-addressbook";
import {useParams} from "react-router";
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import Loader from "../../components/loader";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,} from "recharts";
import {Container, makeStyles, Grid, Paper, Typography, Box, Button, Divider, Hidden} from "@material-ui/core"
import styles from "./styles"
import {calcDaily, formatApy, formatTvl} from "../../helpers/format";
import {isEmpty} from "../../helpers/utils";
import DisplayTags from "../../components/vaultTags";
import {ArrowLeft} from "@material-ui/icons";
import reduxActions from "../redux/actions";
import Deposit from "./components/Deposit";
import Withdraw from "./components/Withdraw";
import TokenCard from "./components/TokenCard";
import StrategyCard from "./components/StrategyCard";
import SafetyCard from "./components/SafetyCard";
import Graph from "./components/Graph";
import AssetsImage from "../../components/AssetsImage";

const useStyles = makeStyles(styles);

const Vault = () => {
    const history = useHistory();
    const classes = useStyles();
    const t = useTranslation().t;

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

    React.useEffect(() => {
        if (item) {
            console.log(item);
        }
    })

    return (
        <Container className={classes.vaultContainer} maxWidth="xl">
            {isLoading ? (
                <Loader message={t( 'Vault-GetData')} />
            ) : (
                <Grid container style={{position: 'relative'}}>
                    <Grid item xs={12} md={8} lg={8} xl={9}>
                        <Button className={classes.btnGoBack} onClick={() => {history.push('/')}}><ArrowLeft /> {t( 'Vault-GoBack')}</Button>
                        <Grid className={classes.title} container>
                            <Grid>
                                <AssetsImage img={item.logo} assets={item.assets} alt={item.name}/>
                            </Grid>
                            <Grid>
                                <Typography variant={"h1"}>{item.name} {t( 'Vault-vault')}</Typography>
                            </Grid>
                        </Grid>
                        <Box className={classes.mobileFix} display="flex" alignItems="center">
                            <Box display={"flex"} alignItems="center">
                                <Box lineHeight={0}>
                                    <img alt={item.network} src={require('../../images/networks/' + item.network + '.svg').default} />
                                </Box>
                                <Box pl={1}>
                                    <Typography className={classes.network} display={"inline"}>
                                        {item.network} {t( 'Vault-network')}
                                    </Typography>
                                </Box>
                                <Box pl={1}>
                                    <DisplayTags tags={item.tags} />
                                </Box>
                            </Box>
                            <Box className={classes.summaryContainer} display={"flex"} 
                                        alignItems="center">
                                <Hidden xsDown>
                                    <Box>
                                        <Divider />
                                    </Box>
                                </Hidden>
                                <Box>
                                    <Typography variant={"h1"}>{formatTvl(item.tvl)}</Typography>
                                    <Typography variant={"body2"}>{t( 'TVL')}</Typography>
                                </Box>
                                <Box>
                                    <Divider />
                                </Box>
                                <Box>
                                    <Typography variant={"h1"}>{calcDaily(item.apy.totalApy)}</Typography>
                                    <Typography variant={"body2"}>{t( 'Vault-Daily')}</Typography>
                                </Box>
                                <Box>
                                    <Divider />
                                </Box>
                                <Box>
                                    <Typography variant={"h1"}>{formatApy(item.apy.totalApy)}</Typography>
                                    <Typography variant={"body2"}>{t( 'APY')}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4} lg={4} xl={3} className={classes.customOrder}>
                        <Box className={classes.dw}>
                            <Box className={classes.tabs}>
                                <Button onClick={() => setDw('deposit')} 
                                            className={dw === 'deposit' ? classes.selected : 
                                            ''}>{t( 'Deposit-Verb')}</Button>
                                <Button onClick={() => setDw('withdraw')} 
                                            className={dw === 'withdraw' ? classes.selected : 
                                            ''}>{t( 'Withdraw-Verb')}</Button>
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
                    <Grid item xs={12} md={8} lg={8} xl={9}>
                        <Graph
                            oracleId={item.oracleId}
                            vaultId={item.id}
                            network={item.network}
                        />
                        {item.risks && item.risks.length > 0 && <SafetyCard vaultRisks={item.risks} score={item.safetyScore}/>}
                        <StrategyCard 
                            stratType={item.stratType}
                            stratAddr={item.strategy}
                            vaultAddr={item.earnContractAddress}
                            network={item.network}
                            apy={item.apy}
                            platform={item.platform}
                            assets={item.assets}
                            want={item.name}
                            vamp={item.vamp}
                        />
                        {renderTokens(item)}
                    </Grid>
                </Grid>
            )}
        </Container>
    )
};

const renderTokens = item => {
    return item.assets.map(asset => {
        if (asset in addressBook[item.network].tokens) {
            return <TokenCard key={asset} token={addressBook[item.network].tokens[asset]} network={item.network} />
        } else return null
    })
}

export default Vault;
