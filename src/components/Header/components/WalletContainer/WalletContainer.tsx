import React from 'react';
import { makeStyles, Box, Avatar, FormControl, Typography, Grid } from '@material-ui/core';
import { renderIcon } from '@download/blockies';
import { createCanvas } from 'canvas';
import { styles } from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { reduxActions } from '../../../../features/redux/actions';
import { ApyStatLoader } from '../../../ApyStatLoader';

const useStyles = makeStyles(styles as any);
const formatAddress = addr => {
  return addr.substr(0, 5) + '...' + addr.substr(addr.length - 5, 5);
};

export const WalletContainer = () => {
  const classes = useStyles();
  const walletReducer = useSelector((state: any) => state.walletReducer);
  const dispatch = useDispatch();
  const [dataUrl, setDataUrl] = React.useState(null);
  const canvas = createCanvas(24, 24);
  const t = useTranslation().t;

  const handleWalletConnect = () => {
    if (!walletReducer.address) {
      dispatch(reduxActions.wallet.connect());
    } else {
      dispatch(reduxActions.wallet.disconnect());
    }
  };

  React.useEffect(() => {
    if (walletReducer.address) {
      renderIcon({ seed: walletReducer.address.toLowerCase() }, canvas);
      setDataUrl(canvas.toDataURL());
    }
  }, [walletReducer.address, canvas]);

  const containerClassName = `${classes.container} ${
    walletReducer.address ? classes.connected : classes.disconnected
  }`;

  const formControlProps = {
    noValidate: true,
    autoComplete: 'off',
    onClick: handleWalletConnect,
  };

  return (
    <Box className={containerClassName}>
      <FormControl {...formControlProps}>
        <Grid container direction="row" alignItems="center">
          {walletReducer.pending ? (
            <Box className={classes.loading}>
              <ApyStatLoader />
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
