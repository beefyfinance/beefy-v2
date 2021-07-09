import React from "react";
import { makeStyles, Grid, Avatar, Button, Hidden, Typography, Box } from "@material-ui/core";
import styles from "./styles"
import HistoricalRateChart from "../../HistoricalRateChart/HistoricalRateChart";

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

    return (
        <Grid container key={item.id}>
            <Button className={[classes.item, classes.roundedLeft, classes.roundedRight].join(' ')} >
            <Box flexGrow={1} textAlign="left">
                <Grid container className={classes.infoContainer}>
                    <Hidden smDown>
                        <Grid>
                            <Avatar src={require('../../../../../images/' + item.logo).default} imgProps={{ style: { objectFit: 'contain' } }} />
                        </Grid>
                    </Hidden>
                    <h1 className={classes.assetName}>BADGER-BUSD</h1>
                    <div>
                        <p>Chain logo</p>
                        <p>Inactive</p>
                        <p>?</p>
                    </div>
                </Grid>

            </Box>
            <Box className={classes.rWidth} textAlign={"left"}>
                <Typography className={classes.h2}>52 LP</Typography>
                <Typography className={classes.h3}>$150 Total</Typography>
            </Box>
            <Hidden smDown>
                <Box className={classes.rWidth} textAlign={"left"}>
                    <Typography className={classes.h2}>50 LP</Typography>
                    <Typography className={classes.h3}>$150 Deposited</Typography>
                </Box>
            </Hidden>
            <Hidden smDown>
                <Box className={classes.rWidth} textAlign={"left"}>
                    <Typography className={classes.h2}>2 LP</Typography>
                    <Typography className={classes.h3}>$20 Yield</Typography>
                </Box>
            </Hidden>
            <Hidden smDown>
                <Box className={classes.rWidth} textAlign={"center"}>
                    <HistoricalRateChart chartData={historicalRateChartData}/>
                    <Typography className={classes.h3}>Daily historical rate</Typography>
                </Box>
            </Hidden>
            <Box className={classes.apyContainer}>
                <Box display="flex">
                    <Typography variant={"h1"}>150%</Typography>
                    <Typography variant={"h2"}>APY</Typography>
                </Box>
                <Box>
                    <Typography variant={"button"}>Withdrawal</Typography>
                </Box>
            </Box>
            </Button>
        </Grid>
    )
}

export default PortfolioItem;
