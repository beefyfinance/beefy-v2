import React from "react";
import {
    Box,
    Divider,
    Grid,
    makeStyles,
    Typography
} from "@material-ui/core";
import styles from "./styles"
import Popover from "../../../../components/Popover";

const useStyles = makeStyles(styles);

const FeeBreakdown = () => {
    const classes = useStyles();

    return (
        <Box mt={2} p={2} className={classes.feeContainer}>
            <Grid container>
                <Grid item xs={12}>
                    <Popover
                    title="Title"
                    description="Description"
                    solid 
                    />
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
    )
}

export default FeeBreakdown;