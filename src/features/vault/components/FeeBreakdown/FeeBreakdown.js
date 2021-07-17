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
                            solid 
                            size='md'
                        >
                            <div className={classes.feeBreakdownBlock}>
                                <Typography className={classes.feeBreakdownBold}>0.7% one time deposit fee</Typography>
                                <Typography className={classes.feeBreakdownDetail}>Goes to the farmed platform, not Beefy</Typography>
                            </div>
                            <div className={classes.feeBreakdownBlock}>
                                <Typography className={classes.feeBreakdownBold}>0.05% one time withdrawal fee</Typography>
                                <Typography className={classes.feeBreakdownDetail}>0.05% one time withdrawal fee distributed across vault participants, to protect users</Typography>
                            </div>
                            <div className={classes.feeBreakdownBlock}>
                                <Typography className={classes.feeBreakdownBold}>4.5% ongoing performance fee </Typography>
                                <Typography className={classes.feeBreakdownDetail}>2.5% Beefy holders</Typography>
                                <Typography className={classes.feeBreakdownDetail}>1.5% treasury</Typography>
                                <Typography className={classes.feeBreakdownDetail}>0.5% vault developers</Typography>
                            </div>
                        </Popover>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>0.7% (0.07)</Typography>
                    <Typography className={classes.label}>Deposit fee</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>0%</Typography>
                    <Typography className={classes.label}>Withdrawal fee</Typography>
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
                    <Typography className={classes.label}>Deposit</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>~0.05 BNB ($0.1)</Typography>
                    <Typography className={classes.label}>Withdrawal</Typography>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FeeBreakdown;