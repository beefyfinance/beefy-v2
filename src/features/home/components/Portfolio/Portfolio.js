import React, { useState, useEffect } from "react";
import { Box, Button, Container, Hidden, makeStyles, Typography } from "@material-ui/core";
import { ExpandLess, ExpandMore, Visibility, VisibilityOff } from "@material-ui/icons";
import { useSelector } from "react-redux";
import AnimateHeight from 'react-animate-height';
import { Alert } from "@material-ui/lab";
import styles from "./styles"
import { useLocation } from "react-router";
import PortfolioItem from "./PortfolioItem";
import BigNumber from "bignumber.js";

const useStyles = makeStyles(styles);

const Portfolio = () => {
    const location = useLocation();
    const classes = useStyles();
    const [portfolioOpen, setPortfolioOpen] = useState(location.portfolioOpen);
    const [hideBalance, setHideBalance] = useState(false);
    const [userVaults, setUserVaults] = useState([]);
    const [totalDeposit, setTotalDeposit] = useState("0.00");
    const [totalDaily, setTotalDaily] = useState("0.00");
    const [totalMonthly, setTotalMonthly] = useState("0.00");
    const balanceReducer = useSelector(state => state.balanceReducer);
    const vaultReducer = useSelector(state => state.vaultReducer);
    const pricesReducer = useSelector(state => state.pricesReducer);
    const walletReducer = useSelector(state => state.walletReducer);

    const BlurredText = ({value}) => {
        return (
            <span className={hideBalance ? classes.blurred : ''}>{value}</span>
        );
    }

    useEffect(() => {
        let newUserVaults = [];

        if (walletReducer.address !== null) {
            Object.keys(balanceReducer.tokens).forEach(tokenName => {
                if (balanceReducer.tokens[tokenName].balance != "0") {
                    let target = Object.values(vaultReducer.pools).find(pool => pool.earnedToken === tokenName);
                    if (target !== undefined) {
                        target.balance = balanceReducer.tokens[tokenName].balance;
                        target.oraclePrice = pricesReducer.prices[target.oracleId];
                        newUserVaults.push(target);
                    }
                }
            })
        }

        setUserVaults(newUserVaults);
    }, [vaultReducer, balanceReducer, walletReducer])

    useEffect(() => {
        let newTotalDeposit = BigNumber(0);

        if (walletReducer.address !== null) {
            if (userVaults.length > 0) {
                userVaults.forEach(vault => {
                    let balance = BigNumber(vault.balance);
                    balance = balance.times(vault.pricePerFullShare).div("1e18").div("1e18");
                    const oraclePrice = pricesReducer.prices[vault.oracleId]
                    newTotalDeposit = newTotalDeposit.plus(balance.times(oraclePrice));
                })
            }
        }

        setTotalDeposit(newTotalDeposit.toFixed(2));

    }, [userVaults, pricesReducer, walletReducer])

    useEffect(() => {
        let newTotalDaily = BigNumber(0);

        if (walletReducer.address !== null) {
            if (userVaults.length > 1) {
                userVaults.forEach(vault => {
                    const apy = vault.apy.totalApy;
                    const daily = apy / 365;
                    let balance = (BigNumber(vault.balance)).div("1e18");
                    balance = balance.times(vault.pricePerFullShare).div("1e18");
                    const oraclePrice = pricesReducer.prices[vault.oracleId]
                    newTotalDaily = newTotalDaily.plus(balance.times(daily).times(oraclePrice));
                })
        
            }
        }

        setTotalDaily(newTotalDaily.toFixed(2));
    }, [userVaults, pricesReducer, walletReducer])

    useEffect(() => {
        setTotalMonthly(BigNumber(totalDaily).times(30).toFixed(2)); 
    }, [totalDaily])

    return (
        <Box className={classes.portfolio}>
            <Container maxWidth="xl">
                <Box display={"flex"} className={[portfolioOpen ? classes.opened : '', classes.mobileFix].join(' ')}>
                    <Box className={classes.balance}>
                        <Button onClick={() => {setHideBalance(!hideBalance)}}>{hideBalance ? (<React.Fragment><VisibilityOff /> Show</React.Fragment>) : (<React.Fragment><Visibility /> Hide</React.Fragment>)} balance</Button>
                    </Box>
                    <Box>
                        <Typography className={classes.h1}>Portfolio</Typography>
                    </Box>
                    <Box className={classes.stats}>
                        <Box className={classes.stat}>
                            <Typography className={classes.h2}><BlurredText value={`$${totalDeposit}`} /></Typography>
                            <Typography className={classes.body1}>Deposited</Typography>
                        </Box>
                        <Box className={classes.stat}>
                            <Typography className={classes.h2}><BlurredText value={"$0"} /></Typography>
                            <Typography className={classes.body1}>Total yield</Typography>
                        </Box>
                        <Box className={classes.stat}>
                            <Typography className={classes.h2}><BlurredText value={`$${totalDaily}`} /></Typography>
                            <Typography className={classes.body1}>Daily yield</Typography>
                        </Box>
                        <Hidden xsDown>
                            <Box className={classes.stat}>
                                <Typography className={classes.h2}><BlurredText value={`$${totalMonthly}`} /></Typography>
                                <Typography className={classes.body1}>Monthly yield</Typography>
                            </Box>
                        </Hidden>
                    </Box>
                </Box>
                <AnimateHeight duration={ 500 } height={ portfolioOpen ? 'auto' : 0 }>
                    {userVaults.length > 0 ? (
                        <>
                            {userVaults.map(vault => (
                                <Box key={vault.id}>
                                    <PortfolioItem 
                                        item={vault}
                                    />
                                </Box>
                            ))}
                        </>
                    ) : (
                        <Box>
                            <Alert severity="info" >No vaults found for this portfolio.</Alert>
                        </Box>
                    )}
                </AnimateHeight>
                <Box display="flex">
                    <Box m="auto">
                        <Button className={classes.toggler} onClick={() => {setPortfolioOpen(!portfolioOpen)}}>{portfolioOpen ? (<ExpandLess />) : (<ExpandMore />)}</Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

export default Portfolio;
