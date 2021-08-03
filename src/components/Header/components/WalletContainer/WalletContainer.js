import React from 'react';
import { makeStyles, Box, Avatar, FormControl, Typography, Grid } from '@material-ui/core';
import { renderIcon } from '@download/blockies';
import { createCanvas } from 'canvas';
import styles from './styles';
import reduxActions from '../../../../features/redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Loader from '../../../loader/loader';

const useStyles = makeStyles(styles);

const formatAddress = addr => {
  return addr.substr(0, 5) + '...' + addr.substr(addr.length - 5, 5);
};

const WalletContainer = () => {
  const classes = useStyles();
  const walletReducer = useSelector(state => state.walletReducer);
  const dispatch = useDispatch();
  const [dataUrl, setDataUrl] = React.useState(null);
  const canvas = createCanvas(24, 24);
  const t = useTranslation().t;

  const handleWalletConnect = () => {
    if (!walletReducer.address) {
      console.log('called connect');
      dispatch(reduxActions.wallet.connect());
    } else {
      console.log('called disconnect');
      dispatch(reduxActions.wallet.disconnect());
    }
  };

  React.useEffect(() => {
    if (walletReducer.address) {
      renderIcon({ seed: walletReducer.address.toLowerCase() }, canvas);
      setDataUrl(canvas.toDataURL());
    }
  }, [walletReducer.address, canvas]);

  return (
    <Box className={walletReducer.address ? classes.connected : classes.wallet}>
      <FormControl noValidate autoComplete="off" onClick={handleWalletConnect}>
        <Grid container direction="row" alignItems="center">
          {walletReducer.pending ? (
            <Box className={classes.loading}>
              <Loader line={true} />
            </Box>
          ) : (
            <React.Fragment>
              {walletReducer.address ? <Avatar src={dataUrl} /> : ''}
              <Typography noWrap={true}>
                {walletReducer.address
                  ? formatAddress(walletReducer.address)
                  : t('Network-ConnectWallet')}
              </Typography>
            </React.Fragment>
          )}
        </Grid>
      </FormControl>
    </Box>
  );
};

export default WalletContainer;
