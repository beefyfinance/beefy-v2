import React from "react";
import BigNumber from "bignumber.js";
import { makeStyles, Grid, Avatar, Button, Hidden, Typography, Box } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { formatApy, formatDecimals } from "../../../../../helpers/format";
import styles from "./styles"
import HistoricalRateChart from "../../HistoricalRateChart/HistoricalRateChart";
import DisplayTags from "../../../../../components/vaultTags";
import Tooltip from "../../../../../components/Tooltip";
import question from "../../../../../images/question.svg";
import vaultStates from "./vaultStates.json";

const historicalRateChartData = [
    { date: "28 Jan", apy: 5.00 },
    { date: "4 Feb", apy: 57.15 },
    { date: "11 Feb", apy: 38.50 },
    { date: "18 Feb", apy: 41.37 },
    { date: "28 March", apy: 95.00 },
    { date: "4 April", apy: 147.15 },
    { date: "11 April", apy: 115.50 },
    { date: "18 April", apy: 179.37 }
];

const useStyles = makeStyles(styles);

const PortfolioItem = ({ item }) => {
    const classes = useStyles();
    const history = useHistory();

    console.log(item);

    const formatBalance = () => {
        const balance = new BigNumber(item.balance);
        return formatDecimals(balance.div("1e18"));
    }

    return (
        <Grid container key={item.id} className={[classes.item, classes.roundedLeft, classes.roundedRight].join(' ')}>
            <Box flexGrow={1} textAlign="left">
                <Grid container className={classes.infoContainer}>
                    <Hidden smDown>
                        <Grid>
                            <Avatar src={require('../../../../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                        </Grid>
                    </Hidden>
                    <Grid>
                        <Box className={classes.title} textAlign={"left"}>
                            <Typography className={classes.h2}>{item.name}</Typography>
                            <Box display="flex" alignItems="center">
                                <Typography display={"inline"}><img alt={item.network} src={require('../../../../../images/networks/' + item.network + '.svg').default} /></Typography>
                                <Box marginRight={0.5}>
                                    <DisplayTags tags={item.tags} />
                                </Box>
                                <Tooltip title={vaultStates["eol"].title} description={vaultStates["eol"].description} direction='left'>
                                    <img alt="More info" src={question} className={classes.moreInfoIcon}/>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

            </Box>
            <Box className={classes.rWidth} textAlign={"left"}>
                <Typography className={classes.h2}>{formatBalance()} LP</Typography>
                <Typography className={classes.h3}><span className={classes.bold}>$150</span> Total</Typography>
            </Box>
            <Hidden mdDown>
                <Box className={classes.rWidth} textAlign={"left"}>
                    <Typography className={classes.h2}>50 LP</Typography>
                    <Typography className={classes.h3}><span className={classes.bold}>$150</span> Deposited</Typography>
                </Box>
            </Hidden>
            <Box className={classes.rWidth} textAlign={"left"}>
                <Typography className={classes.h2}>2 LP</Typography>
                <Typography className={classes.h3}><span className={classes.bold}>$20</span> Yield</Typography>
            </Box>
            <Hidden mdDown>
                <Box className={classes.rWidth} textAlign={"center"}>
                    <HistoricalRateChart chartData={historicalRateChartData}/>
                    <Typography className={classes.h3}>Daily historical rate</Typography>
                </Box>
            </Hidden>
            <Box className={classes.apyContainer}>
                <Box display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="h1">{formatApy(item.apy.totalApy)}</Typography>
                    <Box marginLeft={1}>
                        <Typography variant="h2">APY</Typography>
                    </Box>
                </Box>
                <Box>
                    <Button className={classes.cta} onClick={() => {history.push('/' + item.network + '/vault/' + (item.id))}}>Withdrawal</Button>
                </Box>
            </Box>
        </Grid>
    )
}

export default PortfolioItem;
