import {Box, Button, Divider, Grid, IconButton, InputBase, makeStyles, Paper, Typography} from "@material-ui/core";
import {HelpOutline, ShoppingBasket} from "@material-ui/icons";
import * as React from "react";
import styles from "../styles"
import {useSelector} from "react-redux";
import BigNumber from "bignumber.js";
import {isEmpty} from "../../../../helpers/utils";
import Loader from "../../../../components/loader";

const useStyles = makeStyles(styles);

const Deposit = ({formData, setFormData, item, handleWalletConnect}) => {
    const classes = useStyles();
    const {wallet, balance} = useSelector(state => ({
        wallet: state.walletReducer,
        balance: state.balanceReducer,
    }));

    const [balanceAmount, setBalanceAmount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    const handleInput = (val) => {
        const stripExtraDecimals = (value) => {
            const f = value;
            return (f.indexOf(".") >= 0) ? (f.substr(0, f.indexOf(".")) + f.substr(f.indexOf("."), 9)) : f;
        }

        const value = (parseFloat(val) > balanceAmount) ? balanceAmount : (parseFloat(val) < 0) ? 0 : stripExtraDecimals(val);
        setFormData({...formData, deposit: {amount: value, max: new BigNumber(value).minus(balanceAmount).toNumber() === 0}});
    }

    const handleMax = () => {
        if(balanceAmount > 0) {
            setFormData({...formData, deposit: {amount: balanceAmount, max: true}});
        }
    }

    React.useEffect(() => {
        setBalanceAmount((wallet.address && !isEmpty(balance.balances[item.token])) ? balance.balances[item.token].total : 0)
    }, [wallet.address, item, balance]);

    React.useEffect(() => {
        setIsLoading(balance.isBalancesLoading);
    }, [balance.isBalancesLoading]);

    return (
        <React.Fragment>
            <Box p={3}>
                <Typography className={classes.balanceText}>Balance:</Typography>
                <Box className={classes.balanceContainer} display="flex" alignItems="center">
                    <Box lineHeight={0}>
                        <img alt={item.name} src={require('../../../../images/' + item.logo).default} />
                    </Box>
                    <Box flexGrow={1} pl={1} lineHeight={0}>
                        {isLoading ? (
                            <Loader line={true} />
                        ) : (
                            <Typography variant={"body1"}>{balanceAmount} {item.token}</Typography>
                        )}
                    </Box>
                    <Box>
                        <Button endIcon={<ShoppingBasket />}>Buy Token</Button>
                    </Box>
                </Box>
                <Box className={classes.inputContainer}>
                    <Paper component="form" className={classes.root}>
                        <Box className={classes.inputLogo}>
                            <img alt={item.name} src={require('../../../../images/' + item.logo).default} />
                        </Box>
                        <InputBase placeholder="0.00" value={formData.deposit.amount} onChange={(e) => handleInput(e.target.value)} />
                        <Button onClick={handleMax}>Max</Button>
                    </Paper>
                </Box>
                <Box mt={2} p={2} className={classes.feeContainer}>
                    <Grid container>
                        <Grid item xs={12}>
                            <IconButton style={{float: 'right'}}><HelpOutline /></IconButton>
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
                <Box mt={2}>
                    {wallet.address ? (
                        <Button className={classes.btnSubmit} fullWidth={true} disabled={formData.deposit.amount <= 0}>Deposit {formData.deposit.max ? ('All') : ''}</Button>
                    ) : (
                        <Button className={classes.btnSubmit} fullWidth={true} onClick={handleWalletConnect}>Connect Wallet</Button>
                    )}
                </Box>
            </Box>
            <Box p={1}>
                <Box p={3} className={classes.boostContainer}>
                    <Box display="flex" alignItems="center">
                        <Box lineHeight={0}>
                            <img alt={item.name} src={require('../../../../images/fire.png').default} />
                        </Box>
                        <Box>
                            <Typography variant={"h1"}>Boost</Typography>
                        </Box>
                        <Box>
                            <IconButton><HelpOutline /></IconButton>
                        </Box>
                        <Box flexGrow={1}>
                            <Typography variant={"h2"} align={"right"}>0</Typography>
                        </Box>
                    </Box>
                    <Typography align={"right"}>Receipt Token balance</Typography>
                    <Box pt={4}>
                        <Button disabled={true} className={classes.btnSubmit} fullWidth={true}>Stake Receipt Token</Button>
                    </Box>
                </Box>

            </Box>
        </React.Fragment>
    )
}

export default Deposit;
