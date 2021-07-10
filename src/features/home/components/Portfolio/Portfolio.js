import React, { useState, useEffect } from "react";
import { Box, Button, Container, makeStyles, Typography } from "@material-ui/core";
import { ArrowDropUp, ExpandLess, ExpandMore, Visibility, VisibilityOff } from "@material-ui/icons";
import { useSelector } from "react-redux";
import AnimateHeight from 'react-animate-height';
import {Alert} from "@material-ui/lab";
import styles from "./styles"
import {useLocation} from "react-router";
import PortfolioItem from "./PortfolioItem";

const useStyles = makeStyles(styles);

const Portfolio = () => {
    const location = useLocation();
    const classes = useStyles();
    const [portfolioOpen, setPortfolioOpen] = useState(location.portfolioOpen);
    const [hideBalance, setHideBalance] = useState(false);
    const [userVaults, setUserVaults] = useState([]);
    const balanceReducer = useSelector(state => state.balanceReducer);
    const vaultReducer = useSelector(state => state.vaultReducer);

    const BlurredText = ({value}) => {
        return (
            <span className={hideBalance ? classes.blurred : ''}>{value}</span>
        );
    }

    useEffect(() => {
        console.log('Render');

        let newUserVaults = [];

        Object.keys(balanceReducer.tokens).forEach(tokenName => {
            if (balanceReducer.tokens[tokenName].balance != "0") {
                const target = Object.values(vaultReducer.pools).find(pool => pool.earnedToken === tokenName);
                if (target !== undefined) {
                    newUserVaults.push(target);
                }
            }
        })

        setUserVaults(newUserVaults);
    }, [vaultReducer, balanceReducer])

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
                    <Box>
                        <Box display={"flex"}>
                            <Box pt={1} pb={1} pl={5}>
                                <Typography className={classes.h2}><BlurredText value={"$1.123"} /></Typography>
                                <Typography className={classes.body1}>Deposited</Typography>
                                <Typography className={classes.body2}><ArrowDropUp /> <BlurredText value={"0.59% 1w"} /></Typography>
                            </Box>
                            <Box pt={1} pb={1} pl={5}>
                                <Typography className={classes.h2}><BlurredText value={"$0"} /></Typography>
                                <Typography className={classes.body1}>Total yield</Typography>
                                <Typography className={classes.body2}> <ArrowDropUp /> <BlurredText value={"0.59% 1w"} /></Typography>
                            </Box>
                            <Box pt={1} pb={1} pl={5}>
                                <Typography className={classes.h2}><BlurredText value={"0"} /></Typography>
                                <Typography className={classes.body1}>Daily yield</Typography>
                            </Box>
                        </Box>
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
