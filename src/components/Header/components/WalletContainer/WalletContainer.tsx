import React from 'react';
import { makeStyles, Box, Avatar, FormControl, Typography, Grid } from '@material-ui/core';
import { styles } from './styles';
import { connect, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ApyStatLoader } from '../../../ApyStatLoader';
import { useTheme } from '@material-ui/core/styles';
import {
  selectIsWalletConnected,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet';
import { BeefyState } from '../../../../redux-types';
import {
  askForWalletConnection,
  doDisconnectWallet,
} from '../../../../features/data/actions/wallet';
import { selectIsWalletPending } from '../../../../features/data/selectors/data-loader';

const useStyles = makeStyles(styles as any);
const formatAddress = addr => {
  return addr.substr(0, 5) + '...' + addr.substr(addr.length - 5, 5);
};

export const WalletContainer = connect((state: BeefyState) => {
  const isWalletConnected = selectIsWalletConnected(state);
  const walletAddress = isWalletConnected ? selectWalletAddress(state) : null;
  const walletPending = selectIsWalletPending(state);
  const walletProfileUrl = state.user.wallet.profilePictureUrl;
  return { walletAddress, walletPending, walletProfileUrl };
})(
  ({
    walletAddress,
    walletPending,
    walletProfileUrl,
  }: {
    walletAddress: null | string;
    walletPending: boolean;
    walletProfileUrl: null | string;
  }) => {
    const theme = useTheme();
    const classes = useStyles();
    const dispatch = useDispatch();
    const t = useTranslation().t;

    const handleWalletConnect = () => {
      if (walletAddress) {
        dispatch(doDisconnectWallet());
      } else {
        dispatch(askForWalletConnection());
      }
    };

    const containerClassName = `${classes.container} ${
      walletAddress ? classes.connected : classes.disconnected
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
            {walletPending ? (
              <Box className={classes.loading}>
                <ApyStatLoader
                  foregroundColor={theme.palette.primary.light}
                  backgroundColor={theme.palette.primary.dark}
                />
              </Box>
            ) : (
              <React.Fragment>
                {walletProfileUrl ? <Avatar src={walletProfileUrl} /> : ''}
                <Typography variant="body1" noWrap={true}>
                  {walletAddress ? formatAddress(walletAddress) : t('Network-ConnectWallet')}
                </Typography>
              </React.Fragment>
            )}
          </Grid>
        </FormControl>
      </Box>
    );
  }
);
