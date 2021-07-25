import {
    Box,
    Divider,
    Grid,
    makeStyles,
    Typography
} from "@material-ui/core";
import React from "react";
import {useTranslation} from "react-i18next";
import styles from "./styles"
import Popover from "../../../../components/Popover";
import useFormattedFee from "../../../../hooks/useFormattedFee";

const useStyles = makeStyles(styles);

const FeeBreakdown = ({ depositFee, withdrawalFee }) => {
    const classes = useStyles();
    const t = useTranslation().t;
    const formattedDepositFee = useFormattedFee(depositFee);
    const formattedWithdrawalFee = useFormattedFee(withdrawalFee);

    return (
        <Box mt={2} p={2} className={classes.feeContainer}>
            <Grid container>
                <Grid item xs={12}>
                    <Box display='flex' justifyContent='space-between'>
                        <Typography className={classes.title}>{t( 'Fee-Title')}</Typography>
                        <Popover
                            title={t( 'Fee-Tagline')}
                            solid 
                            size='md'
                        >
                            <div className={classes.feeBreakdownBlock}>
                                <Typography className={classes.feeBreakdownBold}>
                                    {t( 'Fee-DepositAmt', {amt: formattedDepositFee})}
                                </Typography>
                                <Typography className={classes.feeBreakdownDetail}>
                                    {t( 'Fee-DepositTrgt')}
                                </Typography>
                            </div>
                            <div className={classes.feeBreakdownBlock}>
                                <Typography className={classes.feeBreakdownBold}>
                                    {t( 'Fee-WithdrawAmt', {amt: formattedWithdrawalFee})}
                                </Typography>
                                <Typography className={classes.feeBreakdownDetail}>
                                    {t( 'Fee-WithdrawTrgt', {amt: formattedWithdrawalFee})}
                                </Typography>
                            </div>
                            <div className={classes.feeBreakdownBlock}>
                                <Typography className={classes.feeBreakdownBold}>
                                    {t( 'Fee-Perform', {amt: '4.5%'})}
                                </Typography>
                                <Typography className={classes.feeBreakdownDetailPerf}>
                                    {t( 'Fee-PerformHodler', {amt: '2.5%'})}
                                </Typography>
                                <Typography className={classes.feeBreakdownDetailPerf}>
                                    {t( 'Fee-PerformTreas', {amt: '1.5%'})}
                                </Typography>
                                <Typography className={classes.feeBreakdownDetailPerf}>
                                    {t( 'Fee-PerformStrat', {amt: '0.5%'})}
                                </Typography>
                            </div>
                        </Popover>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>{formattedDepositFee}</Typography>
                    <Typography className={classes.label}>{t( 'Fee-Deposit')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>{formattedWithdrawalFee}</Typography>
                    <Typography className={classes.label}>{t( 'Fee-Withdraw')}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Box pt={1}>
                        <Typography className={classes.text}>{t( 'Fee-PerformExt')}</Typography>
                    </Box>
                    <Divider className={classes.divider} />
                    <Typography className={classes.title}>{t( 'Fee-Transaction')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>0.05 BNB ($0.10)</Typography>
                    <Typography className={classes.label}>{t( 'Deposit-Noun')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.value}>0.05 BNB ($0.10)</Typography>
                    <Typography className={classes.label}>{t( 'Withdraw-Noun')}</Typography>
                </Grid>
            </Grid>
        </Box>
    ) //return
} //const FeeBreakdown

export default FeeBreakdown;
