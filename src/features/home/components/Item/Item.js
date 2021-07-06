import {Avatar, Button, Grid, Hidden, makeStyles, Typography} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import DisplayTags from "../../../../components/vaultTags";
import {calcDaily, formatApy, formatTvl} from "../../../../helpers/format";
import * as React from "react";
import styles from "../../styles"
import {useHistory} from "react-router-dom";
import SafetyScore from "../../../../components/SafetyScore";
import HistoricalRateChart from "../HistoricalRateChart/HistoricalRateChart";

const historicalRateChartData = [
    { name: "28 Jan", apy: 5.00 },
    { name: "4 Feb", apy: 57.15 },
    { name: "11 Feb", apy: 38.50 },
    { name: "18 Feb", apy: 41.37 },
    { name: "28 March", apy: 95.00 },
    { name: "4 April", apy: 147.15 },
    { name: "11 April", apy: 115.50 },
    { name: "18 April", apy: 179.37 }
];

const useStyles = makeStyles(styles);

const Item = ({item}) => {
    const classes = useStyles();
    const history = useHistory();

    return (
        <Grid container key={item.id}>
            <Button className={[classes.item, classes.roundedLeft, classes.roundedRight].join(' ')} onClick={() => {history.push('/' + item.network + '/vault/' + (item.id))}}>
                <Box flexGrow={1} textAlign={"left"}>
                    <Grid className={classes.infoContainer} container>
                        <Hidden smDown>
                            <Grid>
                                <Avatar alt={item.name} src={require('../../../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                            </Grid>
                        </Hidden>
                        <Grid>
                            <Box className={classes.title} textAlign={"left"}>
                                <Typography className={classes.h2}>{item.name}</Typography>
                                <Box>
                                    <Typography display={"inline"}><img alt={item.network} src={require('../../../../images/networks/' + item.network + '.svg').default} /></Typography>
                                    <DisplayTags tags={item.tags} />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <Box className={classes.rWidth} textAlign={"left"}>
                    <SafetyScore score={item.safetyScore} whiteLabel size='sm' />
                    <Typography className={classes.h3}>safety score</Typography>
                </Box>
                <Box className={classes.rWidth} textAlign={"left"}>
                    <Typography className={classes.h2}>{formatTvl(item.tvl)}</Typography>
                    <Typography className={classes.h3}>TVL</Typography>
                </Box>
                <Hidden mdDown>
                    <Box className={classes.rWidth} textAlign={"left"}>
                        <Typography className={classes.h2}>{calcDaily(item.apy.totalApy)}</Typography>
                        <Typography className={classes.h3}>Daily</Typography>
                    </Box>
                </Hidden>
                <Hidden mdDown>
                    <Box className={classes.rWidth} textAlign={"center"}>
                        <HistoricalRateChart chartData={historicalRateChartData}/>
                        <Typography className={classes.h3}>Daily historical rate</Typography>
                    </Box>
                </Hidden>
                <Box className={[classes.rWidth, classes.apyBg, classes.roundedRight, classes.apyContainer].join(' ')} textAlign={"center"}>
                    <Typography variant={"h1"}>{formatApy(item.apy.totalApy)}</Typography>
                    <Typography variant={"h2"}>APY</Typography>
                    <Typography variant={"button"}>Deposit</Typography>
                </Box>
            </Button>
        </Grid>
    )
}

export default Item;
