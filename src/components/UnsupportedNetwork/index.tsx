import * as React from 'react';
import { Box, Typography, Button, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { styles } from './styles';

import { reduxActions } from '../../features/redux/actions';

const useStyles = makeStyles(styles as any);
export const UnsupportedNetwork = () => {
  const dispatch = useDispatch();
  const walletReducer = useSelector((state: any) => state.walletReducer);

  const classes = useStyles();
  const handleWalletConnect = () => {
    if (!walletReducer.address) {
      dispatch(reduxActions.wallet.connect());
    } else {
      dispatch(reduxActions.wallet.disconnect());
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box mr={4}>
        <Typography {...({color:"red"} as any)}>We do not support this network.</Typography>
      </Box>
      <Box>
        <Button className={classes.btn} onClick={handleWalletConnect} size="small">
          Switch to BSC
        </Button>
      </Box>
    </Box>
  );
}
