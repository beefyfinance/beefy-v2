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
                    <Box display='flex' justifyContent='space-between'>
                        <Typography className={classes.title}>Beefy Fee:</Typography>
                        <Popover
                            title="What you see is what you earn"
                            description="Description"
                            solid 
                            size='md'
                        />
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>0.7% (0.07)</Typography>
                    <Typography className={classes.text}>Deposit fee</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>0%</Typography>
                    <Typography className={classes.text}>Withdrawal fee</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Box pt={1}>
                        <Typography className={classes.text}>Performance fees are already subtracted from the displayed APY.</Typography>
                    </Box>
                    <Divider className={classes.divider} />
                    <Typography className={classes.title}>Est. Transaction Costs:</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>~0.05 BNB ($0.1)</Typography>
                    <Typography className={classes.text}>Deposit</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>~0.05 BNB ($0.1)</Typography>
                    <Typography className={classes.text}>Withdrawal</Typography>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FeeBreakdown;