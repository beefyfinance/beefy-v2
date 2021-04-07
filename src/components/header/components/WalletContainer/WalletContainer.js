import React from "react";
import {makeStyles, Box, Avatar, TextField, FormControl} from "@material-ui/core";
import styles from "./styles"
import {Lens} from "@material-ui/icons";
import reduxActions from "../../../../features/redux/actions";
import {useDispatch, useSelector} from "react-redux";
import Loader from "../../../loader";

const useStyles = makeStyles(styles);

const formatAddress = (addr) => {
    return addr.substr(0,5) + '...' + addr.substr(addr.length - 5, 5);
}

const WalletContainer = () => {
    const classes = useStyles();
    const walletReducer = useSelector(state => state.walletReducer);
    const dispatch = useDispatch();

    const handleWalletConnect = () => {
        if(!walletReducer.address) {
            console.log('called connect')
            dispatch(reduxActions.wallet.connect());
        } else {
            console.log('called disconnect')
            dispatch(reduxActions.wallet.disconnect());
        }
    }

    React.useEffect(() => {
        console.log('address', walletReducer.address);
    }, [walletReducer.address]);

    return (
        <Box className={classes.wallet}>
            <FormControl noValidate autoComplete="off" onClick={handleWalletConnect}>
                {walletReducer.pending ? (
                    <React.Fragment>
                        <Box style={{position: 'absolute', left:50, top: 14}}>
                            <Loader line={true} />
                        </Box>
                        <TextField label="Wallet" value=' ' InputProps={{readOnly: true}} variant="outlined" />
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Box style={{position: 'absolute', left:0, top: 0}}>
                            <Avatar className={walletReducer.address ? 'on' : 'off'}><Lens /></Avatar>
                        </Box>
                        <TextField label="Wallet" value={walletReducer.address ? formatAddress(walletReducer.address) : 'Connect Wallet'} InputProps={{readOnly: true}} variant="outlined" />
                    </React.Fragment>
                )}
            </FormControl>
        </Box>
    )
}

export default WalletContainer;
