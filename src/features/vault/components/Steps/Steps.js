import {Backdrop, Box, Button, Fade, makeStyles, Modal, Typography} from "@material-ui/core";
import * as React from "react";
import {byDecimals} from "../../../../helpers/format";
import BigNumber from "bignumber.js";
import {ArrowRight} from "@material-ui/icons";
import {isEmpty} from "../../../../helpers/utils";
import {Alert, AlertTitle} from "@material-ui/lab";
import Loader from "../../../../components/loader";
import styles from "../styles";
import {useSelector} from "react-redux";

const useStyles = makeStyles(styles);

const Steps = ({item, steps, handleClose}) => {
    const classes = useStyles();
    const wallet = useSelector(state => state.walletReducer);

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={steps.modal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={steps.modal}>
                {steps.finished ? (
                    <React.Fragment>
                        <Box>
                            <Box p={8} className={classes.finishedCard}>
                                <Typography variant={"h2"}>{byDecimals(new BigNumber(wallet.action.data.amount).multipliedBy(byDecimals(item.pricePerShare)), item.tokenDecimals).toFixed(8)}</Typography>
                                <Typography variant={"h2"}>withdraw confirmed</Typography>
                                <Typography>Funds are on the way</Typography>
                                <Box mt={1} textAlign={"center"}>
                                    <Button className={classes.finishedBtn} href={wallet.explorer[item.network] + '/tx/' + wallet.action.data.receipt.transactionHash} target="_blank">View on Explorer</Button> <Button className={classes.finishedBtn} onClick={handleClose}>Close Dialog</Button>
                                </Box>
                            </Box>
                            <Box mt={2} textAlign={"center"}>
                                <Button className={classes.finishedBtn}>Go to my portfolio <ArrowRight /></Button>
                            </Box>
                        </Box>

                    </React.Fragment>
                ) : (
                    <Box className={classes.paper}>
                        <Typography id="transition-modal-title" variant={"h2"}>{steps.currentStep} / {steps.items.length} transactions<br />confirmed</Typography>
                        <Typography id="transition-modal-description" variant={"body2"}>{!isEmpty(steps.items[steps.currentStep]) ? steps.items[steps.currentStep].message : ''}</Typography>
                        {wallet.action && wallet.action.result === 'error' ? (
                            <Alert severity={"error"}>
                                <AlertTitle>Error</AlertTitle>
                                <Typography>{wallet.action.data.error}</Typography>
                                <Box textAlign={"center"} mt={2}>
                                    <Button variant={"outlined"} onClick={handleClose}>Close</Button>
                                </Box>
                            </Alert>
                        ) : ''}
                        {wallet.action && wallet.action.result === 'success_pending' ? (
                            <Alert severity={"info"}>
                                <AlertTitle>Confirmation Pending</AlertTitle>
                                <Typography>Waiting for network to confirm transaction...</Typography>
                                <Box textAlign={"center"}><Loader /></Box>
                                <Box textAlign={"center"} mt={2}>
                                    <Button variant={"outlined"} href={wallet.explorer[item.network] + '/tx/' + wallet.action.data.hash} target="_blank">View on Explorer</Button>
                                </Box>
                            </Alert>
                        ) : ''}
                    </Box>
                )}
            </Fade>
        </Modal>
    )

}

export default Steps;